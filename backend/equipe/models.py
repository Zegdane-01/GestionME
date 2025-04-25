from django.db import models
from personne.models import Personne
from manager.models import Manager

class Equipe(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=100)
    membres = models.ManyToManyField(Personne, related_name='equipes')
    manager = models.ForeignKey(Manager, on_delete=models.SET_NULL, null=True, related_name='equipes_gerees')
    
    def ajouterCollab(self):
        return True
        
    def retirerCollab(self):
        return True
        
    def changerCollab(self):
        return True
        
    def __str__(self):
        return self.nom