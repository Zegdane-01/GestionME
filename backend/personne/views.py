import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import update_session_auth_hash
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import Personne
from .serializers import PersonneSerializer, PersonneLoginSerializer, PersonneHierarchieSerializer, PersonneCreateSerializer,PersonneUpdateSerializer,ChangePasswordSerializer
from .permissions import IsTeamLeader, IsTeamLeaderN1, IsTeamLeaderN2, IsCollaborateur
from rest_framework.permissions import IsAuthenticated, AllowAny

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [AllowAny]
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

    def post(self, request, format=None):
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
            embauche = row.get("Date d'embauche")
            sexe = str(row.get("Sexe")).strip() if pd.notna(row.get("Sexe")) else None
            position = str(row.get("Position")).strip() if pd.notna(row.get("Position")) else 'T1'
            manager_name = str(row.get("Hierarchical manager")).strip() if pd.notna(row.get("Hierarchical manager")) else None

            # Skip if matricule or name is invalid
            if not matricule or matricule == "nan" or not full_name:
                skipped += 1
                continue

            # Séparer nom complet
            name_parts = full_name.strip().split()
            first_name = name_parts[-1] if len(name_parts) > 1 else ""
            last_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else name_parts[0]

            # Chercher le manager si existe
            manager_obj = None
            if manager_name:
                possible_managers = Personne.objects.filter(
                    Q(first_name__icontains=manager_name) | Q(last_name__icontains=manager_name)
                )
                if possible_managers.exists():
                    manager_obj = possible_managers.first()

            defaults = {
                "first_name": first_name,
                "last_name": last_name,
                "sexe": sexe or "Homme",
                "dt_Embauche": embauche if not pd.isna(embauche) else None,
                "position": position,
                "manager": manager_obj,
                "role": "COLLABORATEUR",
                "status": "En cours",
                "is_active": True,
            }

            # Mise à jour ou création
            obj, created_flag = Personne.objects.update_or_create(
                matricule=matricule,
                defaults=defaults,
            )

            if created_flag:
                obj.set_password(matricule)  # mot de passe par défaut
                obj.save()
                created += 1
            else:
                updated += 1

        return Response({
            "message": "Import terminé.",
            "créés": created,
            "modifiés": updated,
            "ignorés": skipped
        }, status=200)