from rest_framework import serializers
from .models import *
from personne.models import Personne
from django.core.exceptions import ObjectDoesNotExist
import json
from django.utils.dateparse import parse_duration
from datetime import timedelta

def _parse_duration_or_none(value):
    """
    Convertit 'HH:MM:SS' → timedelta.
    Retourne None si value est vide ou None.
    Soulève ValidationError si le format est invalide.
    """
    if not value:
        return None
    td = parse_duration(value)
    if td is None or not isinstance(td, timedelta):
        raise serializers.ValidationError("Format de durée invalide (HH:MM:SS attendu).")
    return td

class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = '__all__'

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Option
        fields = ['id', 'texte', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    correct_keywords = serializers.ListField(
        child=serializers.CharField(max_length=64),
        required=False,
        allow_empty=True
    )
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ['id', 'texte', 'type', 'point', 'options','correct_keywords', 'image']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model  = Quiz
        fields = ['id', 'estimated_time', 'questions']

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'titre', 'video', 'description', 'estimated_time']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id','name', 'file', 'confidentiel', 'estimated_time']


class MiniPersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ('matricule', 'first_name', 'last_name')

class FormationReadSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    resource_count = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    passed_count = serializers.SerializerMethodField()

    created_by = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    domain = serializers.PrimaryKeyRelatedField(
        queryset=Domain.objects.all(),
        allow_null=True,
        required=False
    )
    domain_info = DomainSerializer(source='domain', read_only=True)
    created_by_info = MiniPersonneSerializer(source='created_by',read_only=True)


    modules    = serializers.SerializerMethodField()
    ressources = serializers.SerializerMethodField()
    quiz = serializers.SerializerMethodField( allow_null=True, required=False)

    class Meta:
        model  = Formation
        fields = ['id','titre', 'description', 'image_cover', 'created_by', 'domain', 'statut', 'modules', 'ressources', 'quiz', 'created_by_info', 'domain_info', 'module_count', 'resource_count', 'has_quiz', 'passed_count']
    
    # petits résumés pour modules / ressources
    def get_modules(self, obj):
        return [{'id': m.id, 'titre': m.titre} for m in obj.modules.all()]

    def get_ressources(self, obj):
        return [{'id': r.id, 'name': r.name} for r in obj.ressources.all()]
    
    def get_quiz(self, obj):
        try:
            return QuizSerializer(
                obj.quiz,
                context=self.context
            ).data
        except ObjectDoesNotExist:
            return None
    
    def get_has_quiz(self, obj):
        """Renvoie True si un quiz existe pour cette formation."""
        return Quiz.objects.filter(formation=obj).exists()
    
    def get_module_count(self, obj):
        return obj.modules.count()
    def get_resource_count(self, obj):  
        return obj.ressources.count()

    def get_passed_count(self, obj):
        return obj.userformation_set.filter(status='terminee').count()
    

class FormationWriteSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    resource_count = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    passed_count = serializers.SerializerMethodField()

    created_by = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=True,
        required=False
    )
    domain = serializers.PrimaryKeyRelatedField(
        queryset=Domain.objects.all(),
        allow_null=True,
        required=False
    )
    domain_info = DomainSerializer(source='domain', read_only=True)
    created_by_info = MiniPersonneSerializer(source='created_by',read_only=True)
    modules    = ModuleSerializer(many=True, required=False, allow_empty=True)
    ressources = ResourceSerializer(many=True, required=False, allow_empty=True)
    quiz = serializers.SerializerMethodField( allow_null=True, required=False)

    class Meta:
        model = Formation
        fields = ['id','titre', 'description', 'image_cover', 'created_by', 'domain', 'statut', 'modules', 'ressources', 'quiz', 'created_by_info', 'domain_info', 'module_count', 'resource_count', 'has_quiz', 'passed_count']
    
    def get_quiz(self, obj):
        try:
            return QuizSerializer(
                obj.quiz,
                context=self.context
            ).data
        except ObjectDoesNotExist:
            return None
        
    def get_module_count(self, obj):
        return obj.modules.count()
    def get_resource_count(self, obj):  
        return obj.ressources.count()
    def get_has_quiz(self, obj):
        """Renvoie True si un quiz existe pour cette formation."""
        return Quiz.objects.filter(formation=obj).exists()
    def get_passed_count(self, obj):
        return obj.userformation_set.filter(status='terminee').count()
    
    def get_modules(self, obj):
        return [{'id': m.id, 'titre': m.titre} for m in obj.modules.all()]

    def get_ressources(self, obj):
        return [{'id': r.id, 'name': r.name} for r in obj.ressources.all()]


    def create(self, validated_data):
        request = self.context['request']          # accès à FILES et raw data
        modules_raw    = request.data.get('modules')
        ressources_raw = request.data.get('ressources')
        quiz_raw       = request.data.get('quiz')

        # → Parse JSON s’il existe
        modules_data    = json.loads(modules_raw)    if modules_raw    else []
        ressources_data = json.loads(ressources_raw) if ressources_raw else []
        quiz_data       = json.loads(quiz_raw)       if quiz_raw       else None

        formation = Formation.objects.create(**validated_data)

        # ----- Modules -----
        for idx, m in enumerate(modules_data):
            # fichier vidéo = clé placeholder
            video_file = request.FILES.get(m.get('video'))
            module = Module.objects.create(
                titre          = m['titre'],
                description    = m.get('description', ''),
                estimated_time =  _parse_duration_or_none(m.get('estimated_time')),
                video          = video_file,          # peut être None
            )
            formation.modules.add(module)

        # ----- Ressources -----
        for idx, r in enumerate(ressources_data):
            file_obj = request.FILES.get(r.get('file'))
            resource = Resource.objects.create(
                name           = r['name'],
                file           = file_obj,
                confidentiel   = r.get('confidentiel', False),
                estimated_time = _parse_duration_or_none(r.get('estimated_time')),
            )
            formation.ressources.add(resource)

        # ----- Quiz (+ questions / options) -----
        if quiz_data:
            questions = quiz_data.pop('questions', [])
            quiz = Quiz.objects.create(formation=formation,
                                       estimated_time=_parse_duration_or_none(quiz_data.get('estimated_time')))
            for q in questions:
                q.pop('correct_raw', None) 
                opts = q.pop('options', [])

                # ---------- 1) récupérer le fichier image ----------
                placeholder = q.pop('image', None)          # "question_image_0" ou None
                image_file      = self.context['request'].FILES.get(placeholder)

                # ---------- 2) extraire / nettoyer correct_keywords ----------
                keywords = q.pop('correct_keywords', [])

                question = Question.objects.create(
                    quiz             = quiz,
                    image            = image_file,              # <— FILE ou None
                    correct_keywords = keywords,                # liste JSONField
                    **q                                             # texte, type, point
                )

                # ---------- 3) options ----------
                Option.objects.bulk_create([
                    Option(question=question, **opt) for opt in opts
                ])

        return formation



class UserFormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFormation
        fields = '__all__'

class UserModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModule
        fields = '__all__'

class UserResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResource
        fields = '__all__'

class UserQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuiz
        fields = '__all__'

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = '__all__'
