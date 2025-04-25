from django.db import models
from equipe.models import Equipe
from client.models import Client

class Projet(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    debut_Pdc = models.DateField()
    Fin_Pdc = models.DateField()
    statut = models.CharField(max_length=50)
    description = models.TextField()
    equipe = models.ManyToManyField(Equipe, related_name='projets')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projets')
    
    def ajouterEquipe(self):
        return True
        
    def retirerEquipe(self):
        return True
        
    def modifierEquipe(self):
        return True
        
    def ajouterCl(self):
        return True
        
    def retirerCl(self):
        return True
        
    def modifierCl(self):
        return True
        
    def __str__(self):
        return f"{self.id} - {self.client.nom}"