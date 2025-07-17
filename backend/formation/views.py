import os
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Sum,Q,Avg,F, Case, When, FloatField
from django.db.models.functions import Cast
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication  # si tu utilises SimpleJWT
from rest_framework.authentication import SessionAuthentication
from .models import *
from .serializers import *

class EquipeViewSet(viewsets.ModelViewSet):
    queryset = Equipe.objects.all()
    serializer_class = EquipeSerializer

class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all() 
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Resource.objects.filter(
            Q(confidentiel=False) |
            Q(allowed_equipes__assigned_users=user) |
            Q(allowed_equipes=None)
        ).distinct()

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        resource = self.get_object()
        if not resource.user_has_access(request.user):
            return Response({"detail": "Vous n’avez pas les droits."},
                            status=status.HTTP_403_FORBIDDEN)
        return FileResponse(resource.file.open("rb"),
                            as_attachment=True,
                            filename=resource.file.name.split("/")[-1])

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()

    def get_permissions(self):
        if self.action == 'retrieve':
           return [IsAuthenticated()]     # token ou session obligatoire
        return super().get_permissions()

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return FormationWriteSerializer   # écriture
        return FormationReadSerializer        # lecture détaillée
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Enveloppe toute l'opération de mise à jour dans une transaction de base de données.
        Si une erreur se produit dans le serializer, tout sera annulé.
        """
        return super().update(request, *args, **kwargs)
    
    def perform_destroy(self, instance):
        # Supprimer image de couverture
        if instance.image_cover and instance.image_cover.path and os.path.isfile(instance.image_cover.path):
            os.remove(instance.image_cover.path)

        # Supprimer fichiers et objets Resource liés
        for res in instance.ressources.all():
            if res.file and res.file.path and os.path.isfile(res.file.path):
                os.remove(res.file.path)
            res.delete()

        # Supprimer fichiers et objets Module liés
        for mod in instance.modules.all():
            if mod.video and mod.video.path and os.path.isfile(mod.video.path):
                os.remove(mod.video.path)
            mod.delete()

        # Supprimer fichiers image des questions du quiz
        if hasattr(instance, 'quiz'):
            for q in instance.quiz.questions.all():
                if q.image and q.image.path and os.path.isfile(q.image.path):
                    os.remove(q.image.path)

        # Supprimer la formation elle-même (supprime aussi quiz/questions/options via CASCADE)
        instance.delete()


    @action(detail=True, methods=['get'], url_path='progress',
            permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        """
        ?equipe_id=ID  ➜ filtre par équipe
        ?collaborateur_id=MATR  ➜ filtre par collaborateur
        Les deux ensembles = intersection.
        Sans params ➜ utilisateur connecté.
        """
        formation = self.get_object()

        equipe_id        = request.query_params.get('equipe_id')
        collaborateur_id = request.query_params.get('collaborateur_id')

        personnes = Personne.objects.all()

        # — filtre par équipe (si fourni)
        if equipe_id:
            # get_object_or_404 lève 404 directement si non trouvée
            equipe = get_object_or_404(Equipe, id=equipe_id)
            personnes = personnes.filter(equipes=equipe)

        # — filtre par collaborateur (si fourni)
        if collaborateur_id:
            personnes = personnes.filter(matricule=collaborateur_id)

        # — par défaut, utilisateur courant
        if not equipe_id and not collaborateur_id:
            personnes = Personne.objects.filter(matricule=request.user.matricule)

        # pas de résultat ➜ tableau vide
        if not personnes.exists():
            return Response([], status=status.HTTP_200_OK)


        # — sérialisation
        resp = []
        for p in personnes.distinct():
            ctx = {'request': request, 'user': p}
            data = FormationProgressSerializer(formation, context=ctx).data
            data['collaborateur'] = {
                'id':         p.matricule,
                'matricule':  p.matricule,
                'full_name':  f"{p.first_name} {p.last_name}",
            }
            resp.append(data)

        # si un seul objet et qu’on n’a PAS explicitement demandé toute l’équipe
        if len(resp) == 1 and not (equipe_id and not collaborateur_id):
            return Response(resp[0])

        return Response(resp)

    @action(detail=True, methods=['get'], url_path='filter-options', permission_classes=[IsAuthenticated])
    def filter_options(self, request, pk=None):
        """
        Renvoie les listes complètes d’équipes et de collaborateurs.
        Le front se charge ensuite de filtrer les collaborateurs
        pour l’équipe choisie.
        """
        # 1. Toutes les équipes, triées
        teams_qs = (
            Equipe.objects
            .all()
            .order_by('name')
            .values('id', 'name')
        )

        # 2. Tous les collaborateurs + première équipe
        collaborateurs_qs = (
            Personne.objects
            .prefetch_related('equipes')
            .order_by('first_name', 'last_name')
        )

        collaborateurs_data = []
        for p in collaborateurs_qs:
            first_team = p.equipes.first()
            collaborateurs_data.append({
                "matricule":  p.matricule,
                "full_name":  f"{p.first_name} {p.last_name}",
                "equipe_id":  first_team.id if first_team else None,
                "mail":     p.email,
            })

        return Response({
            "equipes":        list(teams_qs),
            "collaborateurs": collaborateurs_data,
        })

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def submit(self, request, pk=None):
        quiz   = self.get_object()
        user   = request.user
        data   = QuizSubmitSerializer(
                    data=request.data, context={"quiz": quiz}
                 )
        data.is_valid(raise_exception=True)

        # crée ou récupère le UserQuiz
        uq, _ = UserQuiz.objects.get_or_create(user=user, quiz=quiz)

        total_score = 0
        for item in data.validated_data["answers"]:
            q  = quiz.questions.get(id=item["question_id"])
            ua, _ = UserAnswer.objects.get_or_create(user=user, question=q)

            # 1) on enregistre la réponse
            if q.type in ("single_choice", "multiple_choice"):
                opts = Option.objects.filter(id__in=item.get("selected_option_ids", []),
                                             question=q)
                ua.selected_options.set(opts)
            else:
                ua.text_response = item.get("text_response", "")
            ua.save()

            # 2) On calcule le score en utilisant la méthode universelle du modèle
            #    On remplace tout le bloc if/elif/else par un seul appel.
            
            score_for_question = q.get_score_for_answer(
                selected_option_ids=item.get("selected_option_ids"),
                text_response=item.get("text_response")
            )
            total_score += score_for_question

        time_spent_str = request.data.get('time_spent')
        
        # 3) on marque le quiz terminé
        uq.score     = total_score
        uq.completed = True
        uq.completed_at = timezone.now() # Date de complétion
        if time_spent_str:
            uq.time_spent = parse_duration(time_spent_str) # Conversion en timedelta
        
        uq.save()

        return Response(
            {
                "score": total_score,
                "total": sum(q.point for q in quiz.questions.all())
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def my_result(self, request, pk=None):
        quiz = self.get_object()
        user = request.user

        uq = quiz.userquiz_set.filter(user=user).first()
        if not uq:
            return Response({"detail": "Pas de résultat"}, status=status.HTTP_404_NOT_FOUND)

        total_pts = quiz.questions.aggregate(total=Sum("point"))["total"] or 0

        # ⚠️  NE PAS faire de concaténation int + str ici
        return Response(
            {
                "score": uq.score,        # ← entier
                "total": total_pts,       # ← entier
                "completed": uq.completed
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='radar_scores', permission_classes=[IsAuthenticated])
    def radar_scores(self, request):
        user_id = request.query_params.get("user_id")
        equipe_id = request.query_params.get("equipe_id")
        projet_id = request.query_params.get("projet_id")

        personnes = Personne.objects.all()

        if user_id:
            personnes = personnes.filter(matricule=user_id)
        elif equipe_id:
            personnes = personnes.filter(equipes__id=equipe_id)
        elif projet_id:
            personnes = personnes.filter(projet_id=projet_id)

        domaines = Domain.objects.filter(
            equipes__assigned_users__in=personnes
        ).distinct().order_by('name')
        data = []

        for domaine in domaines:
            formations = Formation.objects.filter(domain=domaine)
            quizzes = Quiz.objects.filter(formation__in=formations)
            
            user_quizzes_in_domain = UserQuiz.objects.filter(
                quiz__in=quizzes,
                user__in=personnes,
                completed=True
            )


            if not user_quizzes_in_domain.exists():
                avg_score_percent = None
            else:
                # Cette requête complexe fait le calcul pour nous :
                # Pour chaque UserQuiz, elle calcule le score en pourcentage, puis fait la moyenne de tous ces pourcentages.
                # C'est la méthode la plus juste pour une équipe/projet.
                aggregation = user_quizzes_in_domain.annotate(
                    # Calculer le score maximum possible pour le quiz de chaque ligne UserQuiz
                    max_points=Sum('quiz__questions__point'),
                    # Calculer le score en % pour chaque ligne
                    percentage_score=Case(
                        When(max_points__gt=0, then=Cast(F('score'), FloatField()) * 100.0 / F('max_points')),
                        default=0.0,
                        output_field=FloatField()
                    )
                ).aggregate(
                    # Calculer la moyenne de tous les pourcentages obtenus
                    average_score=Avg('percentage_score')
                )
                avg_score_percent = aggregation.get('average_score') or 0
            
            if( avg_score_percent is None):
                data.append({
                    "domaine": domaine.name,
                    "score": None,
                    "prerequisites": float(domaine.prerequisites_level),
                    "consultant_target": float(domaine.consultant_target),
                    "leader_target": float(domaine.leader_target),
                })
            else:
                data.append({
                    "domaine": domaine.name,
                    "score": round(avg_score_percent, 2),
                    "prerequisites": float(domaine.prerequisites_level),
                    "consultant_target": float(domaine.consultant_target),
                    "leader_target": float(domaine.leader_target),
                })

        return Response(data)

    @action(detail=False, methods=["get"], url_path="competence_table",
        permission_classes=[IsAuthenticated])
    def competence_table(self, request):
        """Retourne un tableau [ {user, equipe, scores:{dom:%}, average:%} ] - Version optimisée et correcte"""
        user_id   = request.query_params.get("user_id")
        equipe_id = request.query_params.get("equipe_id")
        projet_id = request.query_params.get("projet_id")

        personnes = Personne.objects.all().prefetch_related('equipes')
        if user_id:
            personnes = personnes.filter(matricule=user_id)
        elif equipe_id:
            personnes = personnes.filter(equipes__id=equipe_id)
        elif projet_id:
            personnes = personnes.filter(projet_id=projet_id)

        # 1. Requête unique et optimisée pour récupérer tous les résultats des utilisateurs filtrés
        # On annote chaque résultat avec le score maximum possible pour son quiz.
        user_quizzes = UserQuiz.objects.filter(
            user__in=personnes,
            completed=True
        ).select_related(
            'user', 'quiz__formation__domain'
        ).annotate(
            max_points=Sum('quiz__questions__point')
        )

        # 2. On traite les résultats en Python pour regrouper par utilisateur et par domaine
        # La structure sera : { user_id: { domain_id: {'score': X, 'max': Y, 'name': '...' } } }
        processed_data = {}
        for uq in user_quizzes:
            # S'assurer que le quiz est bien lié à un domaine
            if not hasattr(uq.quiz, 'formation') or not uq.quiz.formation.domain:
                continue

            user_id = uq.user_id
            domain = uq.quiz.formation.domain

            # Initialiser les dictionnaires si c'est la première fois qu'on les rencontre
            processed_data.setdefault(user_id, {})
            processed_data[user_id].setdefault(domain.id, {'total_score': 0, 'total_max': 0, 'domain_name': domain.name})

            # Agréger les scores
            processed_data[user_id][domain.id]['total_score'] += uq.score
            # S'assurer que max_points n'est pas None
            processed_data[user_id][domain.id]['total_max'] += uq.max_points or 0

        # 3. On construit la réponse finale
        rows = []
        all_domains = list(Domain.objects.all())          # on les lit une fois
        domain_map = {d.id: d for d in all_domains}       # id → objet

        for pers in personnes:
            user_scores = processed_data.get(pers.matricule, {})
            if not user_scores:
                continue                                  # pas de quiz terminé

            final_scores = {}
            total_pct_sum = 0
            domain_with_scores = 0                        # compteur local 💡

            # domaines où l’utilisateur a un résultat
            for dom_id, data in user_scores.items():
                pct = round(float(data['total_score']) / data['total_max'] * 100) \
                    if data['total_max'] else 0
                d_obj = domain_map[dom_id]
                final_scores[data['domain_name']] = {
                    'score': pct,
                    'prerequisites': float(d_obj.prerequisites_level),
                    'consultant_target': float(d_obj.consultant_target),
                    'leader_target': float(d_obj.leader_target),
                }
                total_pct_sum += pct
                domain_with_scores += 1                   # ← on incrémente ici

            # domaines sans résultat
            for d in all_domains:
                if d.name not in final_scores:
                    final_scores[d.name] = {
                        'score': None,
                        'prerequisites': float(d.prerequisites_level),
                        'consultant_target': float(d.consultant_target),
                        'leader_target': float(d.leader_target),
                    }

            # moyenne sur les seuls domaines scorés
            average = round(total_pct_sum / domain_with_scores) if domain_with_scores else 0

            rows.append({
                "user_id": pers.matricule,
                "user"   : f"{pers.first_name} {pers.last_name}",
                "equipe" : pers.equipes.first().name if pers.equipes.exists() else "__",
                "scores" : final_scores,
                "average": average,
            })

        return Response(rows)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

class UserFormationViewSet(viewsets.ModelViewSet):
    queryset = UserFormation.objects.all()
    permission_classes    = [IsAuthenticated]               # 🔑
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    def get_queryset(self):
        return(
            UserFormation.objects
            .select_related('formation', 'formation__domain')
            .filter(user=self.request.user,
                    formation__statut='actif')
        )
        
    def get_permissions(self):
        if self.action == 'retrieve':
            return [IsAuthenticated()]
        return super().get_permissions()


    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object() # L'instance de UserFormation
        user = request.user
        data = request.data

        # --- ACTION 1: Compléter un module spécifique ---
        # Le front-end enverra: { "completed_module_id": ID }
        module_id = data.get('completed_module_id')
        if module_id:
            try:
                module = instance.formation.modules.get(id=module_id)
                user_module, _ = UserModule.objects.get_or_create(user=user, module=module)
                user_module.completed = True
                user_module.save() # Le signal mettra à jour la progression
            except Module.DoesNotExist:
                return Response({"error": "Module non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        # --- ACTION 2: Valider un onglet entier ---
        # Le front-end enverra: { "completed_tab": "overview" | "resources" }
        tab_name = data.get('completed_tab')
        if tab_name:
            if instance.completed_steps is None:
                instance.completed_steps = {}

            if tab_name == 'overview':
                instance.completed_steps['overview'] = True
                instance.save(update_fields=['completed_steps'])
            
            elif tab_name == 'resources':
                # Marquer toutes les ressources de cette formation comme "lues"
                for resource in instance.formation.ressources.all():
                    user_resource, _ = UserResource.objects.get_or_create(user=user, resource=resource)
                    user_resource.read = True
                    user_resource.save() # Le signal se déclenchera pour chaque, mettant à jour la progression
                instance.completed_steps['resources'] = True
                instance.save(update_fields=['completed_steps'])
            
            elif tab_name == 'quiz' and hasattr(instance.formation, 'quiz'):
                user_quiz, _ = UserQuiz.objects.get_or_create(user=user, quiz=instance.formation.quiz)
                user_quiz.completed = True
                user_quiz.save()
                instance.completed_steps['quiz'] = True
                instance.save(update_fields=['completed_steps'])

        # Après toute action, renvoyer l'état complet et à jour de la formation
        # L'instance de la formation est `instance.formation`
        serializer = FormationDetailSerializer(instance.formation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action == 'complete_step':
            return FormationDetailSerializer
        return UserFormationDetailSerializer

    @action(detail=False, methods=['get'], url_path='by-formation/(?P<formation_id>[^/.]+)')
    def by_formation(self, request, formation_id=None):
        user = request.user
        try:
            formation = Formation.objects.get(pk=formation_id)
        except Formation.DoesNotExist:
            return Response({"error": "Formation introuvable"}, status=404)

        user_formation, _ = UserFormation.objects.get_or_create(user=user, formation=formation)

        user_formation.last_accessed = timezone.now()
        user_formation.save(update_fields=['last_accessed'])

        serializer = FormationDetailSerializer(formation, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete_step(self, request, pk=None):
            """
            Action pour enregistrer la complétion d'une étape (module ou onglet).
            """
            
            user = request.user
            data = request.data

            formation_id = data.get("formation_id")
            module_id = data.get('completed_module_id') or data.get('updates', {}).get('completed_module_id')
            tab_name = data.get('completed_tab') or data.get('updates', {}).get('completed_tab')

            
            try:
                formation = Formation.objects.get(id=formation_id)
            except Formation.DoesNotExist:
                return Response({"error": "Formation introuvable"}, status=404)

            # ÉTAPE CLÉ : On récupère ou on crée l'objet de suivi.
            # Ceci résout définitivement l'erreur "DoesNotExist".
            user_formation, created = UserFormation.objects.get_or_create(
                user=user,
                formation=formation
            )

            delta_time_seconds = data.get("updates", {}).get("delta_time")
            if delta_time_seconds:
                try:
                    # On l'ajoute au temps total existant
                    user_formation.time_spent += timedelta(seconds=int(delta_time_seconds))
                except (TypeError, ValueError):
                    # Ignorer si la valeur n'est pas un nombre valide
                    pass

            if module_id:
                try:
                    module = formation.modules.get(id=module_id)
                    user_module, _ = UserModule.objects.get_or_create(user=user, module=module)
                    user_module.completed = True
                    user_module.save()
                except Module.DoesNotExist:
                    return Response({"error": "Module non trouvé."}, status=status.HTTP_404_NOT_FOUND)

            if tab_name:
                if user_formation.completed_steps is None:
                    user_formation.completed_steps = {}

                if tab_name == 'overview':
                    user_formation.completed_steps['overview'] = True
                elif tab_name == 'resources':
                    for resource in formation.ressources.all():
                        user_resource, _ = UserResource.objects.get_or_create(user=user, resource=resource)
                        user_resource.read = True
                        user_resource.save()
                    user_formation.completed_steps['resources'] = True
                elif tab_name == 'quiz' and hasattr(formation, 'quiz'):
                    user_formation.completed_steps['quiz'] = True
                    
                user_formation.update_progress()
                
                user_formation.save()

            # On renvoie toujours l'objet Formation complet et à jour
            serializer = FormationDetailSerializer(formation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restart') # url_path est optionnel mais recommandé
    @transaction.atomic
    def restart(self, request, pk=None):
        """
        Archive les 3 derniers résultats de quiz de l'utilisateur, puis
        réinitialise sa progression pour une formation spécifique.
        """
        user_formation = self.get_object()
        user = request.user
        formation = user_formation.formation

        # 🔐 Sécurité : Vérifier que l'utilisateur qui fait la demande
        # est bien le propriétaire du suivi.
        if user_formation.user != user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à effectuer cette action."},
                status=status.HTTP_403_FORBIDDEN
            )

        # --- ÉTAPE 1 : ARCHIVAGE (si un quiz existe) ---
        if hasattr(formation, 'quiz'):
            quiz = formation.quiz
            
            # Récupérer les 3 dernières tentatives de cet utilisateur pour ce quiz
            latest_attempts = UserQuiz.objects.filter(
                user=user, quiz=quiz
            ).order_by('-completed_at')[:3]
            
            # Préparer les objets pour la création en masse
            history_to_create = [
                UserQuizHistory(
                    user=user,
                    formation=formation,
                    score=attempt.score,
                    completed_at=attempt.completed_at,
                    time_spent=attempt.time_spent
                ) for attempt in latest_attempts
            ]
            
            # Créer tous les enregistrements d'historique en une seule requête
            if history_to_create:
                UserQuizHistory.objects.bulk_create(history_to_create)

        # --- ÉTAPE 2 : RÉINITIALISATION (logique originale) ---

        # a. Supprimer les suivis des modules liés
        UserModule.objects.filter(user=user, module__in=formation.modules.all()).delete()

        # b. Supprimer les suivis des ressources liées
        UserResource.objects.filter(user=user, resource__in=formation.ressources.all()).delete()

        # c. Supprimer les suivis du quiz (UserQuiz et toutes les UserAnswer)
        if hasattr(formation, 'quiz'):
            quiz = formation.quiz
            UserQuiz.objects.filter(user=user, quiz=quiz).delete()
            UserAnswer.objects.filter(user=user, question__quiz=quiz).delete()

        # d. Réinitialiser l'objet UserFormation principal
        user_formation.progress = 0
        user_formation.status = 'nouvelle'
        user_formation.completed_steps = {}
        user_formation.last_accessed = None
        user_formation.time_spent = timedelta(0)
        user_formation.save()

        # e. Renvoyer l'état mis à jour de la formation
        serializer = FormationDetailSerializer(formation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    # Dans votre ViewSet des formations (FormationViewSet)
    @action(detail=True, methods=['post'], url_path='reset-for-all') 
    @transaction.atomic
    def reset_for_all(self, request, pk=None):
        
        """
        Archive les 3 derniers résultats de quiz pour chaque utilisateur,
        puis réinitialise la formation et le quiz pour tous les utilisateurs inscrits.
        """
        # Récupérer la formation directement (pas UserFormation)
        formation = get_object_or_404(Formation, pk=pk)  # self fait référence au FormationViewSet

        # Identifier tous les utilisateurs inscrits à la formation
        enrolled_users = Personne.objects.filter(userformation__formation=formation)

        if not enrolled_users.exists():
            return Response(
                {"status": "success", "message": f"Aucun utilisateur inscrit à la formation '{formation.titre}'."},
                status=status.HTTP_200_OK
            )

        # Pour chaque utilisateur inscrit, appliquer la même logique que restart
        for user in enrolled_users:
            # Récupérer l'objet UserFormation pour cet utilisateur
            try:
                user_formation = UserFormation.objects.get(user=user, formation=formation)
            except UserFormation.DoesNotExist:
                continue  # Passer à l'utilisateur suivant si pas de UserFormation

            # --- ÉTAPE 1 : ARCHIVAGE (si un quiz existe) ---
            if hasattr(formation, 'quiz'):
                quiz = formation.quiz
                
                # Récupérer les 3 dernières tentatives de cet utilisateur pour ce quiz
                latest_attempts = UserQuiz.objects.filter(
                    user=user, quiz=quiz
                ).order_by('-completed_at')[:3]
                
                # Préparer les objets pour la création en masse
                history_to_create = [
                    UserQuizHistory(
                        user=user,
                        formation=formation,
                        score=attempt.score,
                        completed_at=attempt.completed_at,
                        time_spent=attempt.time_spent
                    ) for attempt in latest_attempts
                ]
                
                # Créer tous les enregistrements d'historique en une seule requête
                if history_to_create:
                    UserQuizHistory.objects.bulk_create(history_to_create)

            # --- ÉTAPE 2 : RÉINITIALISATION (logique identique à restart) ---

            # a. Supprimer les suivis des modules liés
            UserModule.objects.filter(user=user, module__in=formation.modules.all()).delete()

            # b. Supprimer les suivis des ressources liées
            UserResource.objects.filter(user=user, resource__in=formation.ressources.all()).delete()

            # c. Supprimer les suivis du quiz (UserQuiz et toutes les UserAnswer)
            if hasattr(formation, 'quiz'):
                quiz = formation.quiz
                UserQuiz.objects.filter(user=user, quiz=quiz).delete()
                UserAnswer.objects.filter(user=user, question__quiz=quiz).delete()

            # d. Réinitialiser l'objet UserFormation principal
            user_formation.progress = 0
            user_formation.status = 'nouvelle'
            user_formation.completed_steps = {}
            user_formation.last_accessed = None
            user_formation.time_spent = timedelta(0)
            user_formation.save()

        return Response(
            {"status": "success", "message": f"La formation '{formation.titre}' a été réinitialisée pour tous les collaborateurs."},
            status=status.HTTP_200_OK
        )

class UserModuleViewSet(viewsets.ModelViewSet):
    queryset = UserModule.objects.all()
    serializer_class = UserModuleSerializer

class UserResourceViewSet(viewsets.ModelViewSet):
    queryset = UserResource.objects.all()
    serializer_class = UserResourceSerializer

class UserQuizViewSet(viewsets.ModelViewSet):
    queryset = UserQuiz.objects.all()
    serializer_class = UserQuizSerializer

class UserAnswerViewSet(viewsets.ModelViewSet):
    queryset = UserAnswer.objects.all()
    serializer_class = UserAnswerSerializer
