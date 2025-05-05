from rest_framework import serializers
from .models import Manager
from personne.serializers import PersonneSerializer

class ManagerSerializer(PersonneSerializer): 
        class Meta:
            model = Manager
            fields = '__all__'