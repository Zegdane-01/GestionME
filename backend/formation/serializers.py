from rest_framework import serializers
from .models import *
from personne.models import Personne
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_duration
from datetime import timedelta
import json
import os

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

class EquipeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Equipe
        fields = ['id', 'name']

class MiniPersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ('matricule', 'first_name', 'last_name')


class DomainSerializer(serializers.ModelSerializer):
    formation_count = serializers.SerializerMethodField()
    class Meta:
        model = Domain
        fields = [
            'id',
            'name',
            'prerequisites_level',
            'consultant_target',
            'leader_target',
            'formation_count'
        ]

    def get_formation_count(self, obj):
        return obj.formations.count()

class EquipeSerializer(serializers.ModelSerializer):
    assigned_users_info = MiniPersonneSerializer(source='assigned_users', many=True, read_only=True)
    assigned_users_count = serializers.SerializerMethodField()
    domains_info = DomainSerializer(source='domains', many=True, read_only=True)
    domain_count = serializers.SerializerMethodField()

    # On attend une liste de matricules pour les utilisateurs
    assigned_users = serializers.SlugRelatedField(
        queryset=Personne.objects.all(),
        many=True,
        slug_field='matricule',  # On indique que 'matricule' est le champ à utiliser
        required=False
    )
    # On attend une liste d'IDs pour les domaines
    domains = serializers.PrimaryKeyRelatedField(
        queryset=Domain.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Equipe
        fields = ['id', 'name', 'assigned_users', 'domains', 'domain_count', 'assigned_users_count' , 'assigned_users_info', 'domains_info']
    
    def get_assigned_users_count(self, obj):
        """
        Retourne le nombre d'utilisateurs assignés à cette équipe.
        """
        return obj.assigned_users.count()

    def get_domain_count(self, obj):
        """
        Retourne le nombre de domaines associés à cette équipe.
        """
        return obj.domains.count()
    
    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Met à jour une équipe en gérant le transfert des membres.
        """
        # 1. Gérer les champs simples et les relations qui ne nécessitent pas de logique spéciale (comme 'domains')
        # On retire 'assigned_users' car on va le gérer manuellement
        assigned_users_data = validated_data.pop('assigned_users', None)
        instance = super().update(instance, validated_data)

        if assigned_users_data is not None:
            # 2. Pour chaque utilisateur qu'on veut ajouter/conserver dans l'équipe...
            for user in assigned_users_data:
                # ... on le retire de TOUTES les équipes auxquelles il pourrait appartenir.
                # C'est la manière la plus simple et la plus sûre d'assurer qu'il n'est que dans une seule équipe.
                user.equipes.clear()
            
            # 3. Maintenant que les utilisateurs sont "libres", on les assigne à l'équipe en cours de modification.
            instance.assigned_users.set(assigned_users_data)

        return instance



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
    allowed_equipes = serializers.PrimaryKeyRelatedField(
        queryset=Equipe.objects.all(),
        many=True,
        allow_null=True
    )
    allowed_equipes_info = EquipeMiniSerializer(source='allowed_equipes',read_only=True, many=True)

    accessible = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField() 

    class Meta:
        model  = Resource
        fields = [
            'id', 'name','accessible', 'file', 'confidentiel',
            'estimated_time',
            'allowed_equipes',          # écrit
            'allowed_equipes_info'      # lu
        ]
    
    def get_accessible(self, obj):
        request = self.context["request"]
        return obj.user_has_access(request.user)

    def get_file(self, obj):
        request = self.context["request"]
        if obj.user_has_access(request.user):
            return request.build_absolute_uri(obj.file.url)
        return None      


class FormationReadSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    resource_count = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    passed_count = serializers.SerializerMethodField()
    total_estimated_time = serializers.SerializerMethodField()
    assigned_team_count = serializers.SerializerMethodField()
    assigned_person_count = serializers.SerializerMethodField()

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


    modules    = ModuleSerializer(many=True, read_only=True)
    ressources = ResourceSerializer(many=True, read_only=True)
    quiz = serializers.SerializerMethodField( allow_null=True, required=False)

    class Meta:
        model  = Formation
        fields = ['id','titre', 'description', 'image_cover', 'created_by', 'domain', 'statut', 'modules', 'ressources', 'quiz', 'created_by_info', 'domain_info', 'module_count', 'resource_count', 'has_quiz', 'passed_count','total_estimated_time','assigned_team_count', 'assigned_person_count']
    
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
    
    def get_total_estimated_time(self, obj):
        """
        Retourne la durée totale formatée comme une chaîne "HH:MM:SS".
        """
        duration = obj.total_estimated_time # Appel de notre @property du modèle
        
        # Le DurationField est automatiquement sérialisé en chaîne de caractères,
        # mais si on veut contrôler le format, on peut le faire ici.
        # Par défaut, str(duration) donnera un format comme "H:MM:SS" ou "HH:MM:SS.ffffff"
        # On peut le formater pour être sûr d'avoir HH:MM:SS
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return f"{hours:02}:{minutes:02}:{seconds:02}"
        return "00:00:00"
    
    def get_assigned_team_count(self, obj):
        """Retourne le nombre d'équipes assignées à la formation via son domaine."""
        return obj.assigned_teams.count()

    def get_assigned_person_count(self, obj):
        """Retourne le nombre de personnes uniques dans les équipes assignées."""
        return obj.assigned_persons.count()

class FormationWriteSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    resource_count = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    passed_count = serializers.SerializerMethodField()

    created_by = serializers.PrimaryKeyRelatedField(
        queryset=Personne.objects.all(),
        allow_null=False,
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
            equipe_ids = r.get('allowed_equipes', [])
            resource = Resource.objects.create(
                name           = r['name'],
                file           = file_obj,
                confidentiel   = r.get('confidentiel', False),
                estimated_time = _parse_duration_or_none(r.get('estimated_time')),
            )
            if resource.confidentiel and equipe_ids:
                resource.allowed_equipes.set(Equipe.objects.filter(pk__in=equipe_ids))
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

    def update(self, instance, validated_data):
        request = self.context.get('request')
        modules_data = json.loads(request.data.get('modules', '[]'))
        ressources_data = json.loads(request.data.get('ressources', '[]'))

        for field, value in validated_data.items():
            setattr(instance, field, value)

        # Gestion des modules
        old_module_ids = set(instance.modules.values_list('id', flat=True))

       
        instance.modules.clear()
        new_module_ids = set()
        for i, mod_data in enumerate(modules_data):
            mod_id = mod_data.get('id')
            video_key = mod_data.get('video')
            video_file = request.FILES.get(video_key) if video_key else None

            if video_file:
                # si un nouveau fichier a été envoyé, supprimer l'ancien (optionnel)
                old_module = instance.modules.filter(titre=mod_data['titre']).first()
                if old_module and old_module.video:
                    old_module.video.delete(save=False)

                mod = Module.objects.create(
                    titre=mod_data['titre'],
                    description=mod_data['description'],
                    estimated_time=_parse_duration_or_none(mod_data.get('estimated_time')),
                    video=video_file,
                )
            else:
                # retrouver l'ancien module par titre ou ID
                mod = Module.objects.filter(titre=mod_data['titre']).first()
            if mod:
                instance.modules.add(mod)
                new_module_ids.add(mod.id)
        # 3. AJOUT : Identifier et supprimer les modules orphelins
        removed_ids = old_module_ids - new_module_ids
        for mod_id in removed_ids:
            try:
                module_to_check = Module.objects.get(id=mod_id)
                # On vérifie s'il est maintenant lié à 0 formation
                if module_to_check.formations.count() == 0:
                    # Si oui, on supprime le fichier vidéo...
                    if module_to_check.video and os.path.isfile(module_to_check.video.path):
                        os.remove(module_to_check.video.path)
                    # ... et l'objet de la base de données.
                    module_to_check.delete()
            except Module.DoesNotExist:
                pass # Déjà supprimé, rien à faire


        # Gestion des ressources
        old_resource_ids = set(instance.ressources.values_list('id', flat=True))
        processed_resource_ids = []
        for res_data in ressources_data:
            resource_id = res_data.get('id')
            is_confidentiel = res_data.get('confidentiel', False)
            equipe_ids = res_data.get('allowed_equipes', [])

            existing_resource = None
            if resource_id:
                try:
                    existing_resource = Resource.objects.get(id=resource_id, formations=instance)
                except Resource.DoesNotExist:
                    pass

            if existing_resource:
                # --- Mise à jour de la ressource existante ---
                res = existing_resource
                res.name = res_data.get('name', res.name)
                res.estimated_time = _parse_duration_or_none(res_data.get('estimated_time'))
                res.confidentiel = is_confidentiel

                # Gestion du fichier s'il est changé
                file_key = res_data.get('file')
                file_obj = request.FILES.get(file_key) if file_key else None
                if file_obj:
                    if res.file:
                        res.file.delete(save=False)
                    res.file = file_obj
                
                res.save()
            else:
                # --- Création d'une nouvelle ressource ---
                file_key = res_data.get('file')
                file_obj = request.FILES.get(file_key) if file_key else None
                if not file_obj:
                    continue # On ne crée pas une ressource sans fichier
                res = Resource.objects.create(
                    name=res_data.get('name'),
                    estimated_time=_parse_duration_or_none(res_data.get('estimated_time')),
                    confidentiel=is_confidentiel,
                    file=file_obj
                )
            
            # --- Gestion des équipes pour la ressource (nouvelle ou mise à jour) ---
            if res.confidentiel:
                res.allowed_equipes.set(Equipe.objects.filter(pk__in=equipe_ids))
            else:
                res.allowed_equipes.clear()

            # On ajoute l'ID à notre liste
            processed_resource_ids.append(res.id)

        # Synchroniser la liste des ressources de la formation
        instance.ressources.set(processed_resource_ids)

        removed_ids = old_resource_ids - set(processed_resource_ids)
        for res_id in removed_ids:
            try:
                resource_to_check = Resource.objects.get(id=res_id)
                # On vérifie si elle est maintenant liée à 0 formation
                if resource_to_check.formations.count() == 0:
                    if resource_to_check.file and os.path.isfile(resource_to_check.file.path):
                        os.remove(resource_to_check.file.path)
                    resource_to_check.delete()
            except Resource.DoesNotExist:
                pass

        # -----------------------------------------------------------------
        # --- NOUVEAU : GESTION DE LA MISE À JOUR DU QUIZ ---
        # -----------------------------------------------------------------
        quiz_data = json.loads(request.data.get('quiz')) if 'quiz' in request.data else None
        existing_quiz = getattr(instance, 'quiz', None)

        if quiz_data:
            # Le frontend a envoyé des données de quiz (création ou mise à jour)
            questions_data = quiz_data.pop('questions', [])
            
            if not existing_quiz:
                # Créer le quiz s'il n'existait pas
                existing_quiz = Quiz.objects.create(formation=instance)

            # Mettre à jour les champs du quiz (ex: temps estimé)
            existing_quiz.estimated_time = _parse_duration_or_none(quiz_data.get('estimated_time'))
            existing_quiz.save()
            
            # Synchroniser les questions
            question_ids_from_frontend = {q.get('id') for q in questions_data if q.get('id')}
            
            # Supprimer les questions qui ne sont plus dans la liste
            existing_quiz.questions.exclude(id__in=question_ids_from_frontend).delete()
            
            for q_data in questions_data:
                question_id = q_data.get('id')
                options_data = q_data.pop('options', [])

                if question_id:
                    # --- MISE À JOUR D'UNE QUESTION EXISTANTE ---
                    question_obj = Question.objects.get(id=question_id, quiz=existing_quiz)
                    
                    # Mettre à jour les champs simples
                    question_obj.texte = q_data.get('texte', question_obj.texte)
                    question_obj.type = q_data.get('type', question_obj.type)
                    question_obj.point = q_data.get('point', question_obj.point)
                    
                    # Mettre à jour l'image SEULEMENT si une nouvelle est fournie
                    image_placeholder = q_data.get('image')
                    if image_placeholder and request.FILES.get(image_placeholder):
                        if question_obj.image:
                            question_obj.image.delete(save=False) # Supprimer l'ancienne
                        question_obj.image = request.FILES.get(image_placeholder)

                    # Mettre à jour les mots-clés
                    if 'correct_keywords' in q_data:
                        question_obj.correct_keywords = q_data.get('correct_keywords')
                    
                    question_obj.save()
                    
                    # Synchroniser les options (supprimer et recréer, c'est plus simple ici)
                    question_obj.options.all().delete()
                    if options_data:
                        Option.objects.bulk_create([
                            Option(question=question_obj, **opt) for opt in options_data
                        ])

                else:
                    # --- CRÉATION D'UNE NOUVELLE QUESTION ---
                    image_placeholder = q_data.pop('image', None)
                    image_file = request.FILES.get(image_placeholder) if image_placeholder else None
                    keywords = q_data.pop('correct_keywords', [])
                    
                    new_question = Question.objects.create(
                        quiz=existing_quiz,
                        image=image_file,
                        correct_keywords=keywords,
                        **q_data
                    )
                    if options_data:
                        Option.objects.bulk_create([
                            Option(question=new_question, **opt) for opt in options_data
                        ])

        elif existing_quiz:
            # Le frontend n'a envoyé aucune donnée de quiz, cela signifie qu'il faut le supprimer
            existing_quiz.delete()

        # -----------------------------------------------------------------
        # --- FIN DU BLOC QUIZ ---
        # -----------------------------------------------------------------


        # ... le reste de votre fonction update
        instance.save()
        return instance



class UserFormationSerializer(serializers.ModelSerializer):
    formation = serializers.SerializerMethodField()

    class Meta:
        model = UserFormation
        fields = '__all__'

    def get_formation(self, obj):
        request = self.context.get("request")
        return FormationDetailSerializer(obj.formation, context={"request": request}).data
    
class UserFormationDetailSerializer(serializers.ModelSerializer):
    formation = FormationReadSerializer(read_only=True)
    class Meta:
        model = UserFormation
        fields = '__all__'
class UserModuleSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()
    class Meta:
        model = Module
        fields = ("id", "titre", "video", "description",
                  "estimated_time", "completed")
    
    def get_completed(self, obj):
        user = self.context['request'].user
        return UserModule.objects.filter(
            user=user,
            module=obj,
            completed=True
        ).exists()

class UserResourceSerializer(serializers.ModelSerializer):
    allowed_equipes = serializers.PrimaryKeyRelatedField(
        queryset=Equipe.objects.all(),
        many=True,
        allow_null=True
    )
    allowed_equipes_info = EquipeSerializer(source='allowed_equipes',read_only=True, many=True)
    read = serializers.SerializerMethodField()
    accessible = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    class Meta:
        model = Resource
        fields = ("id", "name","accessible", "file",
                  "estimated_time","allowed_equipes", "allowed_equipes_info", "read")

    def get_read(self, obj):
        user = self.context['request'].user
        return UserResource.objects.filter(
            user=user,
            resource=obj,
            read=True
        ).exists()

    def get_accessible(self, obj):
        request = self.context["request"]
        return obj.user_has_access(request.user)

    def get_file(self, obj):
        request = self.context["request"]
        if obj.user_has_access(request.user):
            return request.build_absolute_uri(obj.file.url)
        return None    

class FormationDetailSerializer(serializers.ModelSerializer):
    # listes enrichies
    modules    = UserModuleSerializer(many=True, read_only=True)
    ressources = UserResourceSerializer(many=True, read_only=True)
    quiz = QuizSerializer(read_only = True, allow_null=True)
    quiz_done  = serializers.SerializerMethodField()

    # état d’avancement
    progress   = serializers.SerializerMethodField()
    statut     = serializers.SerializerMethodField()
    userFormationId = serializers.SerializerMethodField()
    tabsCompleted = serializers.SerializerMethodField()
    total_estimated_time = serializers.SerializerMethodField()

    class Meta:
        model  = Formation
        fields = ("id", "titre", "description", "image_cover",
                  "statut", "progress", "userFormationId",
                  "modules", "ressources", "quiz", "quiz_done", "tabsCompleted","total_estimated_time")

    # helpers ----------------------------------------------------
    def _get_user_formation(self, obj):
        user = self.context["request"].user
        uf, _ = UserFormation.objects.get_or_create(user=user, formation=obj)
        return uf

    def get_statut(self, obj):
        return self._get_user_formation(obj).status

    def get_progress(self, obj):
        return self._get_user_formation(obj).progress

    def get_userFormationId(self, obj):
        return self._get_user_formation(obj).id

    def get_quiz_done(self, obj):
        user = self.context["request"].user
        return UserQuiz.objects.filter(user=user,
                                       quiz__formation=obj,
                                       completed=True).exists()
    
    def get_tabsCompleted(self, obj):
        user = self.context["request"].user
        user_formation = self._get_user_formation(obj)

        # 1. Onglet "Vue d'ensemble"
        overview_done = user_formation.completed_steps.get('overview', False)

        # 2. Onglet "Modules"
        modules_done = False
        if obj.modules.exists():
            completed_module_count = UserModule.objects.filter(
                user=user,
                module__in=obj.modules.all(),
                completed=True
            ).count()
            modules_done = completed_module_count == obj.modules.count()

        # 3. Onglet "Ressources"
        resources_done = False
        if obj.ressources.exists():
            read_resource_count = UserResource.objects.filter(
                user=user,
                resource__in=obj.ressources.all(),
                read=True
            ).count()
            resources_done = read_resource_count == obj.ressources.count()

        # 4. Onglet "Quiz"
        quiz_done = self.get_quiz_done(obj)

        return {
            "overview": overview_done,
            "modules": modules_done,
            "resources": resources_done,
            "quiz": quiz_done,
        }
    
    def get_total_estimated_time(self, obj):
        """
        Retourne la durée totale formatée comme une chaîne "HH:MM:SS".
        """
        duration = obj.total_estimated_time # Appel de notre @property du modèle
        
        # Le DurationField est automatiquement sérialisé en chaîne de caractères,
        # mais si on veut contrôler le format, on peut le faire ici.
        # Par défaut, str(duration) donnera un format comme "H:MM:SS" ou "HH:MM:SS.ffffff"
        # On peut le formater pour être sûr d'avoir HH:MM:SS
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return f"{hours:02}:{minutes:02}:{seconds:02}"
        return "00:00:00"
    

class UserQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuiz
        fields = '__all__'

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = '__all__'

class QuizAnswerSerializer(serializers.Serializer):
    question_id         = serializers.IntegerField()
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )
    text_response       = serializers.CharField(required=False, allow_blank=True)


class QuizSubmitSerializer(serializers.Serializer):
    answers = QuizAnswerSerializer(many=True)

    # ex. de validation supplémentaire
    def validate_answers(self, answers):
        quiz = self.context['quiz']
        valid_ids = {q.id for q in quiz.questions.all()}
        for ans in answers:
            if ans['question_id'] not in valid_ids:
                raise serializers.ValidationError(
                    f"Question {ans['question_id']} n'appartient pas à ce quiz."
                )
        return answers


class QuizAnswerDetailSerializer(serializers.ModelSerializer):
    user_response = serializers.SerializerMethodField()
    correct_response = serializers.SerializerMethodField()
    points_awarded = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ('id', 'texte', 'user_response', 'correct_response', 'points_awarded')

    def get_user_response(self, obj):
        user = self.context.get('user')
        user_answer = obj.user_answers.filter(user=user).first()
        if not user_answer:
            return None
        
        if obj.type in ['single_choice', 'multiple_choice']:
            return list(user_answer.selected_options.values_list('texte', flat=True))
        return user_answer.text_response

    def get_correct_response(self, obj):
        if obj.type in ['single_choice', 'multiple_choice']:
            return list(obj.options.filter(is_correct=True).values_list('texte', flat=True))
        return obj.correct_keywords

    def get_points_awarded(self, obj):
        user = self.context.get('user')
        user_answer = obj.user_answers.filter(user=user).first()
        if not user_answer:
            return 0
            
        selected_ids = list(user_answer.selected_options.values_list('id', flat=True))
        return obj.get_score_for_answer(selected_option_ids=selected_ids, text_response=user_answer.text_response)


# NOUVEAU: Sérialiseur pour la section "Résultats du Quiz"
class QuizResultSerializer(serializers.ModelSerializer):
    score_final = serializers.SerializerMethodField()
    temps_passe_minutes = serializers.SerializerMethodField()
    quiz_termine_le = serializers.DateTimeField(source='completed_at', format="%d/%m/%Y")
    detail_des_reponses = serializers.SerializerMethodField()
    
    class Meta:
        model = UserQuiz
        fields = ('score_final', 'temps_passe_minutes', 'quiz_termine_le', 'detail_des_reponses')
        
    def get_score_final(self, obj):
        total_points = obj.quiz.questions.aggregate(total=Sum('point'))['total'] or 100
        return {
            "score": obj.score,
            "total": total_points,
            "percentage": int((obj.score / total_points) * 100) if total_points > 0 else 0
        }

    def get_temps_passe_minutes(self, obj):
        return int(obj.time_spent.total_seconds() / 60) if obj.time_spent else 0

    def get_detail_des_reponses(self, obj):
        questions = obj.quiz.questions.all()
        return QuizAnswerDetailSerializer(questions, many=True, context=self.context).data

# NOUVEAU: Sérialiseur pour la section "Progression par chapitre"
class ChapterProgressSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    estimated_time_min = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ('id', 'titre', 'description', 'status', 'estimated_time_min')

    def get_status(self, obj):
        user = self.context.get('user')
        completed = UserModule.objects.filter(user=user, module=obj, completed=True).exists()
        return "Terminé" if completed else "À faire"
        
    def get_estimated_time_min(self, obj):
        return int(obj.estimated_time.total_seconds() / 60) if obj.estimated_time else 0


# NOUVEAU: Le sérialiseur principal pour la page de progression
class FormationProgressSerializer(serializers.ModelSerializer):
    progression_generale = serializers.SerializerMethodField()
    chapitres_termines = serializers.SerializerMethodField()
    temps_passe_minutes = serializers.SerializerMethodField()
    dernier_acces = serializers.SerializerMethodField()
    progression_par_chapitre = serializers.SerializerMethodField()
    resultats_du_quiz = serializers.SerializerMethodField()
    statut_formation = serializers.SerializerMethodField()
    tabsCompleted = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    has_chapters = serializers.SerializerMethodField()

    domain = serializers.PrimaryKeyRelatedField(
        queryset=Domain.objects.all(),
        allow_null=True,
        required=False
    )
    domain_info = DomainSerializer(source='domain', read_only=True)

    class Meta:
        model = Formation
        fields = (
            'id',
            'titre',
            'domain',
            'domain_info',
            'statut_formation',
            'tabsCompleted',
            'progression_generale',
            'chapitres_termines',
            'temps_passe_minutes',
            'dernier_acces',
            'has_quiz',
            'has_chapters',
            'progression_par_chapitre',
            'resultats_du_quiz',
        )
        
    def _get_user_formation(self, obj):
        user = self.context.get('user')
        if not user:
            return None
        # get_or_create pour s'assurer qu'un suivi existe toujours
        uf, _ = UserFormation.objects.get_or_create(user=user, formation=obj)
        return uf

    def get_progression_generale(self, obj):
        user_formation = self._get_user_formation(obj)
        return user_formation.progress if user_formation else 0

    def get_chapitres_termines(self, obj):
        user = self.context.get('user')
        if not user:
            return {"completed": 0, "total": 0}
            
        completed_count = UserModule.objects.filter(
            user=user, module__in=obj.modules.all(), completed=True
        ).count()
        total_count = obj.modules.count()
        return {"completed": completed_count, "total": total_count}

    def get_temps_passe_minutes(self, obj):
        user_formation = self._get_user_formation(obj)
        if not user_formation:
            return 0
        return int(user_formation.time_spent.total_seconds() / 60)

    def get_dernier_acces(self, obj):
        user_formation = self._get_user_formation(obj)
        if user_formation and user_formation.last_accessed:
            return user_formation.last_accessed.strftime("%d/%m/%Y")
        return None

    def get_progression_par_chapitre(self, obj):
        modules = obj.modules.all().order_by('id') # ou un autre champ d'ordre
        return ChapterProgressSerializer(modules, many=True, context=self.context).data

    def get_resultats_du_quiz(self, obj):
        user = self.context.get('user')
        if not user or not hasattr(obj, 'quiz'):
            return None
            
        user_quiz = UserQuiz.objects.filter(user=user, quiz=obj.quiz, completed=True).first()
        if not user_quiz:
            return None
            
        return QuizResultSerializer(user_quiz, context=self.context).data
    
    def get_statut_formation(self, obj):
        user_formation = self._get_user_formation(obj)
        return user_formation.status
    
    def get_has_quiz(self, obj):
        """Renvoie True si un quiz existe pour cette formation."""
        return Quiz.objects.filter(formation=obj).exists()
    
    def get_has_chapters(self, obj):
        """Renvoie True si la formation a des modules."""
        return obj.modules.exists()
    
    def get_has_resources(self, obj):
        """Renvoie True si la formation a des ressources."""
        return obj.ressources.exists()
    
    def get_quiz_done(self, obj):
        # Utiliser le 'user' du contexte (le collaborateur) et non celui de la requête.
        user = self.context.get("user")
        if not user or not hasattr(obj, 'quiz'):
            return False
        
        return UserQuiz.objects.filter(
            user=user,
            quiz=obj.quiz,
            completed=True
        ).exists()
    

    def get_tabsCompleted(self, obj):
        user = self.context.get("user")
        user_formation = self._get_user_formation(obj)

        if not user_formation or not user:
            return {} # Retourne un dictionnaire vide si pas de contexte

        # On commence avec un dictionnaire vide
        completed_tabs = {}

        # L'onglet "overview" est toujours présent
        completed_tabs['overview'] = user_formation.completed_steps.get('overview', False)

        # On ajoute la clé 'modules' SEULEMENT si la formation a des chapitres
        if self.get_has_chapters(obj):
            completed_module_count = UserModule.objects.filter(
                user=user,
                module__in=obj.modules.all(),
                completed=True
            ).count()
            completed_tabs['modules'] = (completed_module_count == obj.modules.count())

        # On ajoute la clé 'resources' SEULEMENT si la formation a des ressources
        if self.get_has_resources(obj):
            read_resource_count = UserResource.objects.filter(
                user=user,
                resource__in=obj.ressources.all(),
                read=True
            ).count()
            completed_tabs['resources'] = (read_resource_count == obj.ressources.count())

        # On ajoute la clé 'quiz' SEULEMENT si la formation a un quiz
        if self.get_has_quiz(obj):
            completed_tabs['quiz'] = self.get_quiz_done(obj)

        return completed_tabs

    