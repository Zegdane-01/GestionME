import os
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
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

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()

    def get_permissions(self):
        if self.action == 'retrieve':
           return [IsAuthenticated()]     # token ou session obligatoire
        return super().get_permissions()

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return FormationWriteSerializer   # écriture
        if self.action == 'retrieve':
            # Pour la méthode retrieve, on utilise le serializer de lecture détaillée
            return FormationDetailSerializer
        return FormationReadSerializer        # lecture détaillée
    
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

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

class UserFormationViewSet(viewsets.ModelViewSet):
    serializer_class = UserFormationSerializer
    queryset = UserFormation.objects.all()
    def get_queryset(self):
        qs = (
            UserFormation.objects
            .select_related('formation', 'formation__domain')
            .filter(user=self.request.user,
                    formation__statut='actif')
        )
        return qs

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
