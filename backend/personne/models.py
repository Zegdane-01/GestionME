from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class PersonneManager(BaseUserManager):
    def create_user(self, matricule, password=None, **extra_fields):
        if not matricule:
            raise ValueError('Les utilisateurs doivent avoir un matricule.')
        user = self.model(matricule=matricule, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, matricule, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(matricule, password, **extra_fields)

class Personne(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('N1', 'Team Leader N1'),
        ('N2', 'Team Leader N2'),
        ('COLLABORATEUR', 'Collaborateur')
    ]

    matricule = models.CharField(max_length=50, primary_key=True)

    # Add fields from AbstractUser that you need
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    date_joined = models.DateTimeField(default=timezone.now)

    dt_Embauche = models.DateField()
    sexe = models.CharField(max_length=10)
    position = models.CharField(max_length=100)
    role = models.CharField(max_length=100, choices=ROLE_CHOICES)
    telephone = models.CharField(max_length=20)
    password = models.CharField(max_length=128, default='ExpleoME@2025')
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    cv = models.ImageField(upload_to='cvs/', null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True) 

    I_E_CHOICES = [
        ('Intern', 'Intern'),
        ('Extern', 'Extern'),
    ]
    STATUS_CHOICES = [
        ('En formation', 'En formation'),
        ('En cours', 'En cours'),
        ('Bench', 'Bench'),
        ('Out', 'Out'),
        ('Management', 'Management'),
        ('Stage', 'Stage'),
    ]
    I_E = models.CharField(max_length=10, choices=I_E_CHOICES, default='Intern')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='En cours')

    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['password']

    objects = PersonneManager()

    def __str__(self):
        return f"{self.matricule}"

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