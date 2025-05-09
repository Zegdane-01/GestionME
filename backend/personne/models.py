from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from datetime import date


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
    POSITION_CHOICES = [
        ('I1', 'I1'),
        ('I2', 'I2'),
        ('I3', 'I3'),
        ('I4', 'I4'),
        ('I5', 'I5'),
        ('I6', 'I6'),
        ('T1', 'T1'),
        ('T2', 'T2'),
        ('T3', 'T3'),
        ('T4', 'T4'),
        ('T5', 'T5'),
        ('T6', 'T6'),
    ]
    DEPLOME_CHOICES = [
        ('Bac+2', 'Bac+2'),
        ('Bac+3', 'Bac+3'),
        ('Bac+5', 'Bac+5'),
    ]
    STATUS_CHOICES = [
        ('En formation', 'En formation'),
        ('En cours', 'En cours'),
        ('Bench', 'Bench'),
        ('Out', 'Out'),
        ('Management', 'Management'),
        ('Stage', 'Stage'),
    ]
    ROLE_CHOICES = [
        ('TL1', 'Team Leader N1'),
        ('TL2', 'Team Leader N2'),
        ('COLLABORATEUR', 'Collaborateur')
    ]



    matricule = models.CharField(max_length=50, primary_key=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    sexe = models.CharField(max_length=10)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=14)
    role = models.CharField(max_length=100, choices=ROLE_CHOICES)

    dt_Debut_Carriere = models.DateField(default=date.today)
    experience_total = models.IntegerField(default=0)
    dt_Embauche = models.DateField(default=date.today)
    experience_expleo = models.IntegerField(default=0)

    position = models.CharField(max_length=100, choices=POSITION_CHOICES, default='T1')
    deplome = models.CharField(max_length=100,choices=DEPLOME_CHOICES, default='Bac+2')
    specialite_deplome = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='En cours')

    ddc = models.FileField(upload_to='ddc/', null=True, blank=True)

    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='manager_persons'
    )

    backup = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='backup_persons'
    )

    projet = models.ForeignKey(
        'projet.Projet',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projet_persons'
    )


    password = models.CharField(max_length=128)
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)


    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['password']

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True) 

    objects = PersonneManager()

    def calcul_experience_expleo(self):
        today = date.today()
        delta = today.year * 12 + today.month - (self.dt_Embauche.year * 12 + self.dt_Embauche.month)
        return delta
    
    def calcul_experience_total(self):
        today = date.today()
        delta = today.year * 12 + today.month - (self.dt_Debut_Carriere.year * 12 + self.dt_Debut_Carriere.month)
        return delta

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
    
    def save(self, *args, **kwargs):
        # Calculer et stocker les expériences lors de la création ou de la mise à jour
        self.experience_expleo = self.calcul_experience_expleo()
        self.experience_total = self.calcul_experience_total()
        
        super(Personne, self).save(*args, **kwargs)