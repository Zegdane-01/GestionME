
import os
import django

# Assurez-vous que le chemin vers votre fichier settings.py est correct
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from personne.models import Personne
from django.contrib.auth.hashers import check_password

try:
    user = Personne.objects.get(matricule='admin')
    raw_password_to_check = 'admin'
    if check_password(raw_password_to_check, user.password):
        print("Le mot de passe est correct.")
    else:
        print("Le mot de passe est incorrect.")
except Personne.DoesNotExist:
    print("Utilisateur non trouvé.")