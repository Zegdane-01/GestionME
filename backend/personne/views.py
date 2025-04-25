from rest_framework import viewsets, permissions
from .models import Personne
from .serializers import PersonneSerializer

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [permissions.AllowAny]  #