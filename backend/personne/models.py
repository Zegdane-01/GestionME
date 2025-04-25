from django.db import models

class Personne(models.Model):
    matricule = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    dt_Embauche = models.DateField()
    sexe = models.CharField(max_length=10)
    position = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    motDePasse = models.CharField(max_length=255)
    cv = models.ImageField(upload_to='cvs/', null=True, blank=True)

    def seConnecter(self):
        return True
        
    def seDeconnecter(self):
        return True
        
    def __str__(self):
        return f"{self.prenom} {self.nom}"