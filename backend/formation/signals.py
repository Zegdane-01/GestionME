from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserModule, UserResource, UserQuiz, UserFormation

@receiver(post_save, sender=UserModule)
def on_user_module_complete(sender, instance, **kwargs):
    """
    After a UserModule is saved, update the parent UserFormation progress.
    """
    try:
        # A module can be in multiple formations. We need to update all of them.
        for formation in instance.module.formations.all():
            user_formation = UserFormation.objects.get(user=instance.user, formation=formation)
            user_formation.update_progress()
    except UserFormation.DoesNotExist:
        # This can happen if a user is interacting with a module without being enrolled.
        pass


@receiver(post_save, sender=UserResource)
def on_user_resource_read(sender, instance, **kwargs):
    """
    After a UserResource is saved, update the parent UserFormation progress.
    """
    try:
        for formation in instance.resource.formations.all():
            user_formation = UserFormation.objects.get(user=instance.user, formation=formation)
            user_formation.update_progress()
    except UserFormation.DoesNotExist:
        pass


@receiver(post_save, sender=UserQuiz)
def on_user_quiz_complete(sender, instance, **kwargs):
    """
    After a UserQuiz is saved, update the parent UserFormation progress.
    """
    try:
        user_formation = UserFormation.objects.get(user=instance.user, formation=instance.quiz.formation)
        user_formation.update_progress()
    except UserFormation.DoesNotExist:
        pass