from django.db import models
from equipe.models import Equipe
from client.models import Client

class Projet(models.Model):
    code = models.CharField(max_length=50, primary_key=True)
    wo = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=50)
    date_debut = models.DateField()
    chef = models.CharField(max_length=50)
    client = models.CharField(max_length=50)
    statut = models.CharField(max_length=50)
    description = models.TextField()

    def __str__(self):
        return f"{self.code}"