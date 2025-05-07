from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Personne

class PersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = '__all__'
        read_only_fields = ['is_superuser', 'is_staff', 'is_active', 'date_joined','updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

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

class PersonneCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ['matricule', 'password', 'first_name', 'last_name', 'email', 'telephone', 'sexe', 'dt_Embauche', 'position', 'role', 'I_E', 'status']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_matricule(self, value):
        if Personne.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà utilisé.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Personne.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user