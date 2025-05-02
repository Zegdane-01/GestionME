from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Personne

class PersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = '__all__'
        read_only_fields = ['matricule']

class PersonneLoginSerializer(serializers.Serializer):
    matricule = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        matricule = data.get('matricule')
        password = data.get('password')

        if matricule and password:
            user = authenticate(username=matricule, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Compte utilisateur désactivé.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Identifiants invalides.")
        else:
            raise serializers.ValidationError("Doit inclure 'matricule' et 'mot de passe'.")

        return data

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()