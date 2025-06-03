from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('equipes', EquipeViewSet)
router.register('domains', DomainViewSet)
router.register('modules', ModuleViewSet)
router.register('resources', ResourceViewSet)
router.register('formations', FormationViewSet)
router.register('quizzes', QuizViewSet)
router.register('questions', QuestionViewSet)
router.register('options', OptionViewSet)
router.register('user-formations', UserFormationViewSet)
router.register('user-modules', UserModuleViewSet)
router.register('user-resources', UserResourceViewSet)
router.register('user-quizzes', UserQuizViewSet)
router.register('user-answers', UserAnswerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
