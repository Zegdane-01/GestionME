from django.contrib import admin
from .models import UserQuizHistory,UserQuiz, UserFormation

# Register your models here.
admin.site.register(UserQuizHistory)
admin.site.register(UserQuiz)
admin.site.register(UserFormation)
