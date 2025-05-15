from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet, PersonneLoginView, PersonneLogoutView, LogoutView, change_password

router = DefaultRouter()
router.register(r'personnes', PersonneViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', PersonneLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', change_password, name='change_password'),
]