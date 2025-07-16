from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet, HierarchieView, PersonneLoginView, change_password, ImportChargePlanView, download_last_imported_file

router = DefaultRouter()
router.register(r'personnes', PersonneViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('hierarchie/', HierarchieView.as_view(), name='hierarchie'),
    path('login/', PersonneLoginView.as_view(), name='login'),
    path('change-password/', change_password, name='change_password'),
    path('import-excel/', ImportChargePlanView.as_view(), name='import-excel'),
    path('download-latest-excel/', download_last_imported_file),
    
]