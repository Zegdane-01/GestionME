from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Personne
from projet.models import Projet
from datetime import date

class MiniPersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ('matricule', 'first_name', 'last_name')
class MiniProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = ('code', 'nom', 'wo')

class PersonneSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    backup = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    projet = serializers.PrimaryKeyRelatedField(
        queryset = Projet.objects.all(),
        allow_null = True,
        required = False
    )
    manager_info =  MiniPersonneSerializer(source='manager',read_only=True)
    backup_info =  MiniPersonneSerializer(source='backup',read_only=True)
    projet_info = MiniProjetSerializer(source='projet',read_only=True)
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
            'diplome',
            'specialite_diplome',
            'status',
            'ddc',
            'manager',
            'backup',
            'manager_info',
            'backup_info',
            'projet_info',
            'projet',
            'photo',
            'is_staff',
            'is_superuser',
            'is_active',
            'experience_expleo',
            'experience_total',
        ]
        read_only_fields = ['is_superuser', 'is_staff', 'is_active']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

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
            'diplome',
            'specialite_diplome',
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
        extra_kwargs = {'password': {'write_only': True, 'required': False}}
    
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
        if obj.dt_Embauche:
            delta = today.year * 12 + today.month - (obj.dt_Embauche.year * 12 + obj.dt_Embauche.month)
            return delta
        return 0
    
    def get_experience_total(self, obj):
        today = date.today()
        if obj.dt_Debut_Carriere:
            delta = today.year * 12 + today.month - (obj.dt_Debut_Carriere.year * 12 + obj.dt_Debut_Carriere.month)
            return delta
        return 0

    def create(self, validated_data):
        # Extraire le matricule
        matricule = validated_data.get('matricule')

        # Vérifier si un mot de passe a été fourni, sinon utiliser le matricule
        password = validated_data.pop('password', matricule)
        user = Personne.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class PersonneUpdateSerializer(serializers.ModelSerializer):
    experience_expleo = serializers.SerializerMethodField()
    experience_total = serializers.SerializerMethodField()
    manager = serializers.CharField(required=False, allow_null=True)
    backup = serializers.CharField(required=False, allow_null=True)
    projet = serializers.CharField(required=False, allow_null=True)

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
            'diplome',
            'specialite_diplome',
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
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'manager': {'required': False}, # Ensure they are not explicitly read_only
            'backup': {'required': False},  # Ensure they are not explicitly read_only
            'projet': {'required': False},  # Ensure they are not explicitly read_only
        }

    def validate_matricule(self, value):
        """Valider le matricule pour éviter les doublons, sauf pour le matricule de la personne mise à jour."""
        instance = self.instance
        if instance and value != instance.matricule and Personne.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà utilisé.")
        return value
    
    def validate_ddc(self, value):
        """Valider le fichier ddc pour s'assurer que c'est un fichier Word."""
        if value and not (value.name.endswith('.docx') or value.name.endswith('.doc')):
            raise serializers.ValidationError('Le fichier doit être au format .doc ou .docx')
        return value
    
    def get_experience_expleo(self, obj):
        today = date.today()
        if obj.dt_Embauche:
            delta = today.year * 12 + today.month - (obj.dt_Embauche.year * 12 + obj.dt_Embauche.month)
            return delta
        return 0
    
    def get_experience_total(self, obj):
        today = date.today()
        if obj.dt_Debut_Carriere:
            delta = today.year * 12 + today.month - (obj.dt_Debut_Carriere.year * 12 + obj.dt_Debut_Carriere.month)
            return delta
        return 0

    def update(self, instance, validated_data):
        """Met à jour les champs de l'objet Personne existant."""
        # Si un mot de passe est fourni, on le met à jour
        password = validated_data.pop('password', None)
        photo = validated_data.pop('photo', None)
        ddc = validated_data.pop('ddc', None)
        manager_matricule = self.initial_data.get('manager')
        backup_matricule = self.initial_data.get('backup')
        projet_id = self.initial_data.get('projet')

        if password:
            instance.set_password(password)

        if photo:
            instance.photo = photo
        # sinon, ne rien faire → on garde l'ancien
        if ddc:
            instance.ddc = ddc

        # Gérer la mise à jour du manager
        if manager_matricule:
            try:
                instance.manager = Personne.objects.get(matricule=manager_matricule)
            except Personne.DoesNotExist:
                raise serializers.ValidationError({'manager': 'Matricule de manager invalide.'})

        # Gérer la mise à jour du backup
        if backup_matricule:
            try:
                instance.backup = Personne.objects.get(matricule=backup_matricule)
            except Personne.DoesNotExist:
                raise serializers.ValidationError({'backup': 'Matricule de backup invalide.'})

        # Gérer la mise à jour du projet
        if projet_id:
            try:
                instance.projet = Projet.objects.get(id=projet_id)
            except Projet.DoesNotExist:
                raise serializers.ValidationError({'projet': 'ID de projet invalide.'})
        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Sauvegarder les modifications
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
