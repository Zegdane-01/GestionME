from rest_framework import serializers
from .models import Manager
from personne.serializers import PersonneSerializer

class ManagerSerializer(serializers.ModelSerializer):
    personne = PersonneSerializer(read_only=True)
    manager_superieur_detail = serializers.SerializerMethodField()

    class Meta:
        model = Manager
        fields = ['id', 'personne', 'niveau', 'manager_superieur', 'manager_superieur_detail']
        read_only_fields = ['id']

    def get_manager_superieur_detail(self, obj):
        if obj.manager_superieur:
            return f"{obj.manager_superieur.personne.matricule} - {obj.manager_superieur.personne.role}"
        return None