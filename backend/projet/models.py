from django.db import models
from django.conf import settings  # ou import de votre app Personne

class Projet(models.Model):
    # Clé primaire explicite (sinon Django crée automatiquement un AutoField)
    projet_id = models.AutoField(primary_key=True)

    nom               = models.CharField(max_length=255) # *Nom de projet
    code              = models.CharField(max_length=50, unique=True, blank=True, null=True) # *Code projet
    ordre_travail     = models.CharField(max_length=50, blank=True, null=True) # Ordre de travail (facultatif)
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
        ('In Progress', 'In Progress'),
        ('On Hold', 'On Hold'),
        ('Closed', 'Closed'),

    ]

    statut            = models.CharField(
                          max_length=12,
                          choices=STATUT_CHOICES,
                          default='In Progress',
                        ) # *Statut
    descriptif        = models.TextField(blank=True, null=True) # *Descriptif

    def count_collaborators(self):
        """
        Returns the number of collaborators assigned to this project.
        """
        # 'projet_persons' is the related_name defined in Personne's ForeignKey to Projet
        return self.projet_persons.count()


    def __str__(self):
        return f"{self.code} – {self.nom}"
