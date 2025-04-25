from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet

router = DefaultRouter()
router.register(r'', PersonneViewSet)

urlpatterns = [
    path('', include(router.urls)),
]