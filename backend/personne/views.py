import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import update_session_auth_hash
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.db.models import Q
import pandas as pd
from .models import Personne
from .serializers import PersonneSerializer, PersonneLoginSerializer, PersonneHierarchieSerializer, PersonneCreateSerializer,PersonneUpdateSerializer,ChangePasswordSerializer
from .permissions import IsTeamLeader, IsTeamLeaderN1, IsTeamLeaderN2, IsCollaborateur
from rest_framework.permissions import IsAuthenticated, AllowAny

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'matricule'

    def get_serializer_class(self):
        if self.action == 'create':
            return PersonneCreateSerializer
        return PersonneSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("❌ Erreurs de validation :", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, id, *args, **kwargs):
        """Met à jour les données d'une personne existante."""
        personne = self.get_object(id)
        serializer = PersonneUpdateSerializer(personne, data=request.data)

        if serializer.is_valid():
            print("✅ Mise à jour réussie :", serializer.validated_data)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Personne supprimée avec succès'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated], url_path='me')
    def me(self, request):
        personne = request.user  # récupère l'utilisateur connecté
        
        if request.method == 'GET':
            serializer = self.get_serializer(personne)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = PersonneUpdateSerializer(personne, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HierarchieView(APIView):
    def get(self, request):
        # Prendre les personnes au sommet (sans manager)
        leaders = Personne.objects.filter(manager__isnull=True)
        serializer = PersonneHierarchieSerializer(leaders, many=True)
        return Response(serializer.data)

class PersonneLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PersonneLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

            response_data['is_manager'] = True
            response_data['user'] = PersonneSerializer(user).data  # Utilisez PersonneSerializer pour les non-managers

            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.data.get('old_password')):
            return Response(
                {"detail": "Ancien mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.data.get('new_password'))
        user.save()
        update_session_auth_hash(request, user)
        return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImportExcelPersonneView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        POSITIONS_VALIDES = {'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'}
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier reçu'}, status=400)

        try:
            df = pd.read_excel(file, sheet_name="Plan de charge ME 2025")
        except Exception as e:
            return Response({'error': f"Erreur de lecture Excel : {str(e)}"}, status=400)

        created, updated, skipped = 0, 0, 0

        for _, row in df.iterrows():
            matricule = str(row.get("Matricule")).strip()
            full_name = str(row.get("Name")).strip()
            raw_embauche = row.get("Date d'embauche")
            sexe = str(row.get("Sexe")).strip() if pd.notna(row.get("Sexe")) else None

            raw_position = str(row.get("Position")).strip() if pd.notna(row.get("Position")) else ''
            position = raw_position if raw_position in POSITIONS_VALIDES else 'T1'

            manager_name = str(row.get("Hierarchical manager")).strip() if pd.notna(row.get("Hierarchical manager")) else None
            Status = str(row.get("Status")).strip() if pd.notna(row.get("Status")) else None

            # Validation
            if not matricule or matricule == "nan" or not full_name:
                skipped += 1
                continue

            # Convertir date d'embauche
            try:
                if pd.isna(raw_embauche):
                    date_embauche = None
                elif isinstance(raw_embauche, str):
                    date_embauche = pd.to_datetime(raw_embauche).date()
                elif isinstance(raw_embauche, pd.Timestamp):
                    date_embauche = raw_embauche.date()
                else:
                    date_embauche = raw_embauche
            except Exception:
                date_embauche = None

            # Extraire last_name (2 premiers mots en MAJUSCULES), puis reste = first_name
            parts = full_name.strip().split()
            last_name_parts = []
            first_name_parts = []

            # On parcourt les mots pour trouver la séparation
            for part in parts:
                # Si le mot est entièrement en majuscules ET qu'on n'a pas encore trouvé de prénom
                if part.isupper():
                    last_name_parts.append(part)
                else:
                    first_name_parts.append(part)

            last_name = " ".join(last_name_parts)
            first_name = " ".join(first_name_parts)

            # Chercher le manager si possible
            manager_obj = None
            if manager_name:
                manager_name_cleaned = manager_name.replace(" ", "").upper()

                for m in Personne.objects.all():
                    fn = m.first_name or ""
                    ln = m.last_name or ""

                    full_1 = (fn + ln).replace(" ", "").upper()
                    full_2 = (ln + fn).replace(" ", "").upper()
                    ln_clean = ln.replace(" ", "").upper()

                    if (
                        manager_name_cleaned in full_1 or
                        manager_name_cleaned in full_2 or
                        manager_name_cleaned in ln_clean
                    ):
                        manager_obj = m
                        break

            try:
                personne = Personne.objects.get(matricule=matricule)
                # Mise à jour sans changer nom/prénom
                personne.dt_Embauche = date_embauche or personne.dt_Embauche
                personne.position = position or personne.position
                personne.manager = manager_obj or personne.manager
                status=Status,
                personne.save()
                updated += 1
            except Personne.DoesNotExist:
                # Création
                personne = Personne.objects.create_user(
                    matricule=matricule,
                    password=matricule,
                    first_name=first_name,
                    last_name=last_name,
                    sexe=sexe or "Homme",
                    dt_Debut_Carriere=None,  # Pas de date de début de carrière dans l'import
                    dt_Embauche=date_embauche,
                    position=position,
                    manager=manager_obj,
                    role='COLLABORATEUR',
                    status=Status,
                    is_active=False
                )
                created += 1

        return Response({
            "message": "Import terminé.",
            "créés": created,
            "modifiés": updated,
            "ignorés": skipped
        }, status=200)

