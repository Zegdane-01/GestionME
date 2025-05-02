from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet, PersonneLoginView, PersonneLogoutView

router = DefaultRouter()
router.register(r'', PersonneViewSet)

urlpatterns = [
    path('personne/', include(router.urls)),
    path('login/', PersonneLoginView.as_view(), name='login'),
    path('logout/', PersonneLogoutView.as_view(), name='logout'),
]