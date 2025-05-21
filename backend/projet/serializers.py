from rest_framework import serializers
from .models import Projet
from personne.models import Personne
from personne.serializers import MiniPersonneSerializer

class ProjetSerializer(serializers.ModelSerializer):
    tl = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    tl_info = MiniPersonneSerializer(source='tl',read_only=True)
    class Meta:
        model = Projet
        fields = '__all__'