from django.db import models
from equipe.models import Equipe
from client.models import Client

class Projet(models.Model):
    CHOIX_STATUT = [
        ('Actif', 'Actif'),
        ('Passif', 'Passif'),
    ]
    code = models.CharField(max_length=50, primary_key=True)
    wo = models.CharField(max_length=50, unique=True, blank=True)
    nom = models.CharField(max_length=50, blank=True)
    date_debut = models.DateField()
    chef = models.CharField(max_length=50, blank=True)
    client = models.CharField(max_length=50, blank=True)
    statut = models.CharField(max_length=50, choices=CHOIX_STATUT, default='Actif')
    description = models.TextField()

    def __str__(self):
        return f"{self.code}"