from django.db import models
from personne.models import Personne

class Fonction(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=100)
    personne = models.ManyToManyField(Personne, related_name='fonctions')
    
    def mettreAJour(self):
        pass
        
    def __str__(self):
        return self.nom