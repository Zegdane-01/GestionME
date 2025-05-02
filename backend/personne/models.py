from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class PersonneManager(BaseUserManager):
    def create_user(self, matricule, password=None, **extra_fields):
        user = self.model(matricule=matricule, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, matricule, password=None, **extra_fields):
        user = self.model(matricule=matricule, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Personne(AbstractBaseUser):
    ROLE_CHOICES = [
        ('N1', 'Team Leader N1'),
        ('N2', 'Team Leader N2'),
        ('COLLABORATEUR', 'Collaborateur')
    ]

    matricule = models.CharField(max_length=50, primary_key=True)
    dt_Embauche = models.DateField()
    sexe = models.CharField(max_length=10)
    position = models.CharField(max_length=100)
    role = models.CharField(max_length=100, choices=ROLE_CHOICES)
    telephone = models.CharField(max_length=20)
    password = models.CharField(max_length=128, default='default_password')
    cv = models.ImageField(upload_to='cvs/', null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True) 

    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['dt_Embauche', 'sexe', 'position', 'role', 'telephone']

    objects = PersonneManager()

    def __str__(self):
        return f"{self.matricule} - {self.role}"

    def natural_key(self):
        return (self.matricule,)

    def get_by_natural_key(self, matricule):
        return self.__class__.objects.get(matricule=matricule)
    
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser