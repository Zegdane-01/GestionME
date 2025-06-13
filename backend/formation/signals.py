# formation/signals.py

from django.db import transaction # <--- AJOUTEZ CET IMPORT
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserModule, UserResource, UserQuiz, UserFormation

@receiver(post_save, sender=UserModule)
def on_user_module_complete(sender, instance, **kwargs):
    for formation in instance.module.formations.all():
        user_formation, created = UserFormation.objects.get_or_create(
            user=instance.user,
            formation=formation
        )
        # On attend que la transaction soit validée avant de lancer le calcul
        transaction.on_commit(lambda: user_formation.update_progress())

@receiver(post_save, sender=UserResource)
def on_user_resource_read(sender, instance, **kwargs):
    for formation in instance.resource.formations.all():
        user_formation, created = UserFormation.objects.get_or_create(
            user=instance.user,
            formation=formation
        )
        # On attend que la transaction soit validée avant de lancer le calcul
        transaction.on_commit(lambda: user_formation.update_progress())

@receiver(post_save, sender=UserQuiz)
def on_user_quiz_complete(sender, instance, **kwargs):
    user_formation, created = UserFormation.objects.get_or_create(
        user=instance.user,
        formation=instance.quiz.formation
    )
    # On attend que la transaction soit validée avant de lancer le calcul
    transaction.on_commit(lambda: user_formation.update_progress())