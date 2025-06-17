from django.db import models
from django.conf import settings

ALLOWED_MANAGER_ROLES = ("TL1", "TL2") 

class TimedContent(models.Model):
    estimated_time = models.DurationField()

    class Meta:
        abstract = True

class Equipe(models.Model):
    name = models.CharField(max_length=100)
    assigned_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='equipes',blank=True, null=True)

    def __str__(self):
        return self.name

class Domain(models.Model):
    name = models.CharField(max_length=100)
    image_cover = models.ImageField(upload_to='domains/',blank=True, null=True)
    equipes = models.ManyToManyField(Equipe, related_name='domains',blank=True, null=True)

    def __str__(self):
        return self.name

class Module(TimedContent):
    titre = models.CharField(max_length=200)
    video = models.FileField(upload_to='modules/videos/')
    description = models.TextField()
    estimated_time = models.DurationField(default='00:00:00')

    def __str__(self):
        return self.titre

class Resource(TimedContent):
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    confidentiel = models.BooleanField(default=False)
    allowed_equipes = models.ManyToManyField(
        Equipe,
        blank=True,
        related_name='resources_access'
    )

    estimated_time  = models.DurationField(default='00:00:00')

    def __str__(self):
        return self.name
    
    def clean(self):
        """
        Si confidentiel=False ➜ on vide automatiquement allowed_equipes
        (évite de garder des relations inutiles en DB).
        """
        if not self.confidentiel and self.pk:       # instance déjà sauvegardée
            self.allowed_equipes.clear()
            
    def user_has_access(self, user):
        """Retourne True si l’utilisateur peut lire/télécharger la ressource"""
        if not self.confidentiel:
            return True
        if getattr(user, "role", None) in ALLOWED_MANAGER_ROLES:
            return True
        print('----------------')
        print("Equipes autorisées :", list(self.allowed_equipes.values_list('id', 'name')))
        print(self.allowed_equipes.values_list('id', 'name','assigned_users'))
        print(user)
        print('----------------')

        return self.allowed_equipes.filter(assigned_users=user).exists()

class Formation(models.Model):
    STATUS_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image_cover = models.ImageField(upload_to='formations/',blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_formations')
    domain = models.ForeignKey(Domain, on_delete=models.SET_NULL, null=True, related_name='formations')
    modules = models.ManyToManyField(Module, related_name='formations',blank=True, null=True)
    ressources = models.ManyToManyField(Resource, related_name='formations', blank=True, null=True)
    statut = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')

    def __str__(self):
        return self.titre

class Quiz(TimedContent):
    formation = models.OneToOneField(Formation, on_delete=models.CASCADE, related_name='quiz')

    def __str__(self):
        return f"Quiz: {self.formation.titre}"

class Question(models.Model):
    TYPE_CHOICES = [
        ('single_choice', 'Un choix'),
        ('multiple_choice', 'Plusieurs choix'),
        ('text', 'Texte libre'),
        ('image_text', 'Voir image et insérer texte'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    texte = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    point = models.PositiveIntegerField(default=1)
    image            = models.ImageField(upload_to='quiz/questions/', null=True, blank=True)
    correct_keywords = models.JSONField(default=list, blank=True) 

    def __str__(self):
        return self.texte[:50]
    
    def check_answer(self, user_text: str) -> bool:
        """
        Retourne True si la réponse 'user_text' contient TOUS les mots-clés
        définis dans 'correct_keywords'.  Non sensible à la casse.
        Concerne uniquement les questions de type 'image_text'.
        """
        if self.type != 'image_text':
            return False   # ne s'applique pas

        if not user_text:
            return False

        answer = user_text.lower()
        return all(kw.lower() in answer for kw in self.correct_keywords)

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    texte = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.texte

class UserFormation(models.Model):
    STATUS_CHOICES = [
        ('nouvelle', 'Nouvelle'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    formation = models.ForeignKey(Formation, on_delete=models.CASCADE)
    progress = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='nouvelle')
    completed_steps = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user} - {self.formation.titre}"
    
    def update_progress(self):
        print("✅ CHECK 5: DANS la méthode 'update_progress'.")
        """
        Calculates and updates the user's progress for this formation.
        Also updates the status based on the progress.
        """
        # Count total items in the formation
        total_modules = self.formation.modules.count()
        total_resources = self.formation.ressources.count()
        has_quiz = 1 if hasattr(self.formation, 'quiz') else 0

        overview_item = 1 
        total_items = overview_item + total_modules + total_resources + has_quiz

        if total_items == 0:
            self.progress = 100
            self.status = 'terminee'
            self.save()
            return

        # Count completed items for the user
        # We need to filter by the modules/resources that belong to THIS formation

        completed_overview = 1 if self.completed_steps.get('overview', False) else 0

        completed_modules = UserModule.objects.filter(
            user=self.user, 
            module__in=self.formation.modules.all(), 
            completed=True
        ).count()
        
        completed_resources = UserResource.objects.filter(
            user=self.user, 
            resource__in=self.formation.ressources.all(), 
            read=True
        ).count()

        quiz_completed = 0
        if has_quiz:
            quiz_completed = UserQuiz.objects.filter(
                user=self.user, 
                quiz=self.formation.quiz, 
                completed=True
            ).count()

        completed_items = completed_overview + completed_modules + completed_resources + quiz_completed
        
        # Calculate progress percentage
        self.progress = int((completed_items / total_items) * 100)
        # AJOUTEZ CES PRINTS POUR VOIR LES DÉTAILS DU CALCUL
        print(f"    -> Détails (complétés/total):")
        print(f"    -> Overview: {completed_overview}/{overview_item}")
        print(f"    -> Modules: {completed_modules}/{total_modules}")
        print(f"    -> Ressources: {completed_resources}/{total_resources}")
        print(f"    -> Quiz: {quiz_completed}/{has_quiz}")
        print(f"    -> TOTAL: {completed_items}/{total_items}")

        # Update status
        if self.progress == 100:
            print(f"  -> NOUVEAU POURCENTAGE: {self.progress}%")
            self.status = 'terminee'
        elif self.progress > 0:
            print(f"    -> NOUVEAU POURCENTAGE CALCULÉ : {self.progress}%")
            self.status = 'en_cours'
        else:
            self.status = 'nouvelle'
            
        self.save()
        print(f"  -> NOUVELLE SAUVEGARDE EN DB : {self.progress}% | Statut : {self.status} | Étapes : {self.completed_steps}")

class UserModule(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.module.titre}"

class UserResource(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.resource.name}"

class UserQuiz(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user} - {self.quiz}"

class UserAnswer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.ManyToManyField(Option, blank=True)
    text_response = models.TextField(blank=True, null=True)
    image_response = models.ImageField(upload_to='answers/', blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.question.texte[:30]}"
