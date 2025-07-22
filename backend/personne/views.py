import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import update_session_auth_hash
from django.utils.dateparse import parse_date
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.db.models import Count, Q
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.http import FileResponse
import pandas as pd
import os
from .models import Personne, ImportedExcel
from projet.models import Projet 
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
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request, id, *args, **kwargs):
        """Met à jour les données d'une personne existante."""
        personne = self.get_object(id)
        serializer = PersonneUpdateSerializer(personne, data=request.data)

        if serializer.is_valid():
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

class ImportChargePlanView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        POSITIONS_VALIDES = {'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'}
        file = request.FILES.get('file')

        last_import = ImportedExcel.objects.first()
        if last_import:
            if last_import.fichier and os.path.isfile(last_import.fichier.path):
                os.remove(last_import.fichier.path)
            last_import.delete()

        # Enregistrer le nouveau fichier
        imported_file = ImportedExcel.objects.create(fichier=file)


        sheetName = request.POST.get('sheet_name') or 'Plan de charge ME 2025'
        if not file:
            return Response({'error': 'Aucun fichier reçu'}, status=400)

        try:
            xls = pd.ExcelFile(file)
            if sheetName not in xls.sheet_names:
                return Response({'error': f"La feuille '{sheetName}' n'existe pas dans le fichier Excel."}, status=400)
            df = pd.read_excel(xls, sheet_name=sheetName)
        except Exception as e:
            return Response({'error': f"Erreur de lecture Excel : {str(e)}"}, status=400)
        
        date_column_name = None
        for col in df.columns:
            # str(col).startswith(...) est la fonction clé ici
            if str(col).strip().startswith('Début PdC'):
                date_column_name = col
                break # On s'arrête dès qu'on a trouvé la colonne

        # 2. Si aucune colonne ne correspond, on retourne une erreur claire
        if not date_column_name:
            return Response({
                'error': "Colonne introuvable.",
                'message': "Aucune colonne commençant par 'Début Pdc' n'a été trouvée dans le fichier."
            }, status=400)
        
        

        projets_crees, projets_modifies, projets_ignores = 0, 0, 0
        for _, row in df.iterrows():

             # 1. Extraire les champs pour notre clé composite
            nom_projet = str(row.get("Project name", "")).strip()
            client_final = str(row.get("Client", "")).strip()

            # 1. On récupère la valeur brute et on la met en minuscules
            raw_sop = str(row.get("I/E", "")).strip().lower()

            # 2. On définit une valeur par défaut
            sop_value = "Interne" 

            # 3. On vérifie si elle commence par "exter"
            if raw_sop.startswith("exter"):
                sop_value = "Externe"

            # On a besoin au minimum d'un nom et d'un client pour identifier le projet
            if not nom_projet or not client_final:
                projets_ignores += 1
                continue
            
            donnees_projet = {
                'ordre_travail': str(row.get("WO", "")).strip(),
                'sop': sop_value,
                'final_client': str(row.get("Client",client_final)),
            }
            # Gestion de la date
            

            raw_date_demarrage = row.get(date_column_name)
            if pd.notna(raw_date_demarrage):
                date_dt = pd.to_datetime(raw_date_demarrage, errors='coerce')
                if pd.notna(date_dt):
                    donnees_projet['date_demarrage'] = date_dt.date()

            # 3. Chercher les projets existants avec notre clé composite
            projets_existants = Projet.objects.filter(nom=nom_projet)

            if projets_existants.count() == 1:
                # CAS 1 : Un seul projet trouvé. On le met à jour.
                projet = projets_existants.first()
                has_changed = False
                for key, value in donnees_projet.items():
                     if getattr(projet, key) != value:
                        # Si les valeurs sont différentes, on met à jour l'attribut et on note qu'il y a eu un changement
                        setattr(projet, key, value)
                        has_changed = True
                if has_changed:
                    projet.save()
                    projets_modifies += 1
                
            elif projets_existants.count() == 0:
                # CAS 2 : Aucun projet trouvé. On le crée.
                Projet.objects.create(
                    nom=nom_projet,
                    final_client=client_final,
                    **donnees_projet
                )
                projets_crees += 1

            else: # projets_existants.count() > 1
                # CAS 3 : Plusieurs projets ont le même nom pour le même client.
                # C'est une ambiguïté. On ignore la ligne pour ne pas corrompre les données.
                projets_ignores += 1
                continue




        created, updated, skipped = 0, 0, 0

        for _, row in df.iterrows():
            matricule = str(row.get("Matricule")).strip()
            full_name = str(row.get("Name")).strip()
            raw_embauche = row.get("Date d'embauche")
            sexe = str(row.get("Sexe")).strip() if pd.notna(row.get("Sexe")) else None

            raw_position = str(row.get("Position")).strip() if pd.notna(row.get("Position")) else ''
            position_f = raw_position if raw_position in POSITIONS_VALIDES else 'T1'

            manager_name = str(row.get("Hierarchical manager")).strip() if pd.notna(row.get("Hierarchical manager")) else None
            Status = str(row.get("Status")).strip() if pd.notna(row.get("Status")) else None
            profile_f = str(row.get("Profil")).strip() if pd.notna(row.get("Profil")) else None
            projet_name = str(row.get("Project name")).strip() if pd.notna(row.get("Project name")) else None

            if projet_name:                                # évite les '' ou None
                try:
                    projet_c = Projet.objects.filter(nom=projet_name).first()
                except ObjectDoesNotExist:
                    projet_c = None
                except MultipleObjectsReturned:
                    projet_c = Projet.objects.filter(nom=projet_name).first()
            else:
                projet_c = None

            # Validation
            if not matricule or matricule == "nan":
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
                has_changed = False
                if personne.dt_Embauche != date_embauche and date_embauche is not None:
                    personne.dt_Embauche = date_embauche or personne.dt_Embauche
                    has_changed = True
                
                if personne.position != position_f and position_f:
                    personne.position = position_f or personne.position
                    has_changed = True

                if personne.manager != manager_obj and manager_obj:
                    personne.manager = manager_obj or personne.manager
                    has_changed = True

                if personne.status != Status and Status:
                    personne.status = Status or personne.status
                    has_changed = True

                if personne.profile != profile_f and profile_f:
                    personne.profile = profile_f or personne.profile
                    has_changed = True

                if personne.projet != projet_c and projet_c:
                    personne.projet =  projet_c or personne.projet
                    has_changed = True
                
                if has_changed:
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
                    position=position_f,
                    manager=manager_obj,
                    role='COLLABORATEUR',
                    projet=projet_c,
                    status=Status,
                    profile=profile_f,
                    is_active=False
                )
                created += 1

        return Response({
            "message": "Importation terminée avec succès.",
            # On ajoute la clé "résumé" qui contient les deux objets
            "résumé": {
                "personnes": {
                    "créés": created,
                    "modifiés": updated,
                    "ignorés": skipped
                },
                "projets": {
                    "créés": projets_crees,
                    "modifiés": projets_modifies,
                    "ignorés": projets_ignores,
                },
            }
        }, status=200)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_last_imported_file(request):
    latest = ImportedExcel.objects.order_by('-importé_le').first()
    if not latest or not latest.fichier:
        return Response({'error': 'Aucun fichier disponible'}, status=404)
    return FileResponse(open(latest.fichier.path, 'rb'), as_attachment=True, filename=latest.fichier.name)


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated] # Protéger l'accès

    def get(self, request, *args, **kwargs):
        # --- Widget 1: Statut des collaborateurs (Donut Chart) ---
        collaborators_qs = Personne.objects.all()
        total_headcount = collaborators_qs.count()
        
        status_counts = collaborators_qs.values('status').annotate(count=Count('status'))
        # Exemple de formatage: {'En cours': 39, 'Bench': 6, ...}
        by_status = {item['status']: item['count'] for item in status_counts}

        sexe_counts = collaborators_qs.values('sexe').annotate(count=Count('sexe'))
        # Exemple de formatage: {'Homme': 35, 'Femme': 13}
        by_sexe = {item['sexe']: item['count'] for item in sexe_counts}

        # --- Widget 2: Répartition par profil (Radar Chart) ---
        profile_counts = collaborators_qs.exclude(profile=None).exclude(profile='').values('profile').annotate(count=Count('profile'))
        # Exemple de formatage: [{'profil': 'RFOE', 'count': 5}, ...]
        by_profile = list(profile_counts)
        

        # --- Assemblage de la réponse ---
        data = {
            'collaborator_stats': {
                'total_headcount': total_headcount,
                'by_status': by_status,
                'by_sexe': by_sexe
            },
            'profile_distribution': by_profile,
            # Ajoutez ici les données pour les autres widgets...
        }
        
        return Response(data)
