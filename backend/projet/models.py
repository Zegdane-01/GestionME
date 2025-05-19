from django.db import models
from django.conf import settings  # ou import de votre app Personne

class Projet(models.Model):
    # Clé primaire explicite (sinon Django crée automatiquement un AutoField)
    projet_id = models.AutoField(primary_key=True)

    nom               = models.CharField(max_length=255) # *Nom de projet
    code              = models.CharField(max_length=50, unique=True) # *Code projet
    ordre_travail     = models.CharField(max_length=50, blank=True, null=True) # Ordre de travail (facultatif)
    direct_client     = models.CharField(max_length=255) # *Direct Client
    final_client      = models.CharField(max_length=255)  # *Final Client

    SOP_CHOICES = [
        ('Interne', 'Interne'),
        ('Externe', 'Externe'),
    ]
    sop               = models.CharField(max_length=10, choices=SOP_CHOICES)  # *SOP Projet
    ibu               = models.CharField(max_length=100, blank=True, null=True) # IBU (secteur)
    cbu               = models.CharField(max_length=50, blank=True, null=True)  # CBU (ex: ME/PCPR)
    tl                = models.ForeignKey(
                            'personne.Personne',  # ou settings.AUTH_USER_MODEL si c'est votre user model
                             related_name='projets_tl',
                            on_delete=models.PROTECT,
                            blank=True, null=True
                        ) # Team Leader
    date_demarrage    = models.DateField() # *Date de démarrage
    chef_de_projet    = models.CharField(max_length=255, blank=True, null=True) # Chef de projet


    STATUT_CHOICES = [
        ('Actif', 'Actif'),
        ('Inactif', 'Inactif'),
    ]

    statut            = models.CharField(
                          max_length=10,
                          choices=STATUT_CHOICES,
                          default='Actif',
                        ) # *Statut
    descriptif        = models.TextField() # *Descriptif

    def __str__(self):
        return f"{self.code} – {self.nom}"
