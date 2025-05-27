from rest_framework import serializers
from .models import Projet
from personne.models import Personne


class ProjetSerializer(serializers.ModelSerializer):
    from personne.serializers import MiniPersonneSerializer

    tl = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    tl_info = MiniPersonneSerializer(source='tl',read_only=True)
    collaborators_count = serializers.IntegerField(source='count_collaborators', read_only=True)
    class Meta:
        model = Projet
        fields = [
            'projet_id',
            'nom',
            'code',
            'ordre_travail',
            'direct_client',
            'final_client',
            'sop',
            'ibu',
            'cbu',
            'tl',
            'date_demarrage',
            'statut',
            'descriptif',
            'chef_de_projet',
            'tl_info',
            'collaborators_count'
        ]

