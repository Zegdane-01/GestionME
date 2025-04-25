from django.db import models

class Client(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=100)
    description = models.TextField()
    
    def __str__(self):
        return self.nom