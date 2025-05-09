from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Personne
from datetime import date

class MiniPersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ('matricule', 'first_name', 'last_name')

class PersonneSerializer(serializers.ModelSerializer):
    manager = MiniPersonneSerializer(read_only=True)
    backup = MiniPersonneSerializer(read_only=True)
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
    experience_expleo = serializers.SerializerMethodField()
    experience_total = serializers.SerializerMethodField()

    class Meta:
        model = Personne
        fields = [
            'matricule',
            'password',
            'first_name',
            'last_name',
            'sexe',
            'email',
            'telephone',
            'role',
            'dt_Debut_Carriere',
            'dt_Embauche',
            'position',
            'deplome',
            'specialite_deplome',
            'status',
            'ddc',
            'manager',
            'backup',
            'projet',
            'photo',
            'is_staff',
            'is_superuser',
            'is_active',
            'experience_expleo',
            'experience_total',
        ]
    extra_kwargs = {'password': {'write_only': True}}
    
    def validate_matricule(self, value):
        if Personne.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà utilisé.")
        return value
    
    def validate_ddc(self, value):
        """Valider le fichier ddc pour s'assurer que c'est un fichier Word"""
        if not value.name.endswith('.docx') and not value.name.endswith('.doc'):
            raise serializers.ValidationError('Le fichier doit être au format .doc ou .docx')
        return value
    
    def get_experience_expleo(self, obj):
        today = date.today()
        delta = today.year * 12 + today.month - (obj.dt_Embauche.year * 12 + obj.dt_Embauche.month)
        return delta
    
    def get_experience_total(self, obj):
        today = date.today()
        delta = today.year * 12 + today.month - (obj.dt_Debut_Carriere.year * 12 + obj.dt_Debut_Carriere.month)
        return delta

    def create(self, validated_data):
        # Extraire le matricule
        matricule = validated_data.get('matricule')

        # Vérifier si un mot de passe a été fourni, sinon utiliser le matricule
        password = validated_data.pop('password', matricule)
        user = Personne.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user