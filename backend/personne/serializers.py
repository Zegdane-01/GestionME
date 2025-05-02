from rest_framework import serializers
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
            from django.contrib.auth import authenticate
            user = authenticate(request=self.context.get('request'), username=matricule, password=password)
            if user is None:
                raise serializers.ValidationError('Identifiants invalides.')
        else:
            raise serializers.ValidationError('Veuillez fournir le matricule et le mot de passe.')

        data['user'] = user
        return data