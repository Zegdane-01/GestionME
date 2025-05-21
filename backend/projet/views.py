from .models import Projet
from .serializers import ProjetSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

class ProjetViewSet(viewsets.ModelViewSet):
        queryset = Projet.objects.all()
        serializer_class = ProjetSerializer
        permission_classes = [AllowAny]

