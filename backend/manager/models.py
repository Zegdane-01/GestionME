from django.db import models
from personne.models import Personne

class Manager(models.Model):
    personne = models.OneToOneField(Personne, on_delete=models.CASCADE)
    niveau = models.CharField(max_length=50)
    manager_superieur = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='managers_subordonnes')
    
    def __str__(self):
        return f"{self.personne.prenom} {self.personne.nom} - {self.niveau}"

    def natural_key(self):
        return (self.matricule,)

    def get_by_natural_key(self, matricule):
        return self.__class__.objects.get(matricule=matricule)