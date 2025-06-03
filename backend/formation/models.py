from django.db import models
from django.conf import settings

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
    allowed_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='allowed_resources')

    def __str__(self):
        return self.name

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

    def __str__(self):
        return f"{self.user} - {self.formation.titre}"

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
