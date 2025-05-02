from django.db import models
from personne.models import Personne

class Manager(Personne):
    niveau = models.CharField(max_length=50)
    manager_superieur = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='managers_subordonnes')

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2')):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f""  # Utiliser self.matricule (hérité de Personne)

    def natural_key(self):
        return (self.matricule,)

    def get_by_natural_key(self, matricule):
        return self.__class__.objects.get(matricule=matricule)