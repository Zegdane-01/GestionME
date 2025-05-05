from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet, PersonneLoginView, PersonneLogoutView, LogoutView

router = DefaultRouter()
router.register(r'', PersonneViewSet)

urlpatterns = [
    path('personne/', include(router.urls)),
    path('login/', PersonneLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]