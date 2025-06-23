import os
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Sum,Q
from django.http import FileResponse
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

        # 3) on marque le quiz terminé
        uq.score     = total_score
        uq.completed = True
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
            personnes = personnes.filter(projet__id=projet_id)

        domaines = Domain.objects.all()
        data = []

        for domaine in domaines:
            formations = Formation.objects.filter(domain=domaine)
            quizzes = Quiz.objects.filter(formation__in=formations)
            
            total_user_score = UserQuiz.objects.filter(
                quiz__in=quizzes,
                user__in=personnes,
                completed=True
            ).aggregate(total=Sum('score'))['total'] or 0

            total_possible_score = Question.objects.filter(
                quiz__in=quizzes
            ).aggregate(total=Sum('point'))['total'] or 0

            score_normalise = (total_user_score / total_possible_score * 4) if total_possible_score else 0

            data.append({
                "domaine": domaine.name,
                "score": round(score_normalise, 2)
            })

        return Response(data)
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
                    user_formation.update_progress()
                elif tab_name == 'resources':
                    for resource in formation.ressources.all():
                        user_resource, _ = UserResource.objects.get_or_create(user=user, resource=resource)
                        user_resource.read = True
                        user_resource.save()
                    user_formation.completed_steps['resources'] = True
                    user_formation.update_progress()
                elif tab_name == 'quiz' and hasattr(formation, 'quiz'):
                    user_formation.completed_steps['quiz'] = True
                    user_formation.update_progress()
                
                user_formation.save()

            # On renvoie toujours l'objet Formation complet et à jour
            serializer = FormationDetailSerializer(formation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def restart(self, request, pk=None):
        """
        Réinitialise la progression d'un utilisateur pour une formation spécifique.
        """
        user_formation = self.get_object()
        user = request.user
        formation = user_formation.formation

        # Vérifier que l'utilisateur qui fait la demande est bien le propriétaire du suivi
        if user_formation.user != user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à effectuer cette action."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 1. Supprimer les suivis des modules liés
        UserModule.objects.filter(user=user, module__in=formation.modules.all()).delete()

        # 2. Supprimer les suivis des ressources liées
        UserResource.objects.filter(user=user, resource__in=formation.ressources.all()).delete()

        # 3. Supprimer les suivis du quiz (UserQuiz et toutes les UserAnswer)
        if hasattr(formation, 'quiz'):
            quiz = formation.quiz
            UserQuiz.objects.filter(user=user, quiz=quiz).delete()
            # Supprimer les réponses aux questions de ce quiz
            UserAnswer.objects.filter(user=user, question__quiz=quiz).delete()

        # 4. Réinitialiser l'objet UserFormation principal
        user_formation.progress = 0
        user_formation.status = 'nouvelle'
        user_formation.completed_steps = {}
        user_formation.save()

        # 5. Renvoyer l'état mis à jour de la formation
        # Le serializer a besoin du contexte de la requête
        serializer = FormationDetailSerializer(formation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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
