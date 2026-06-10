from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

class CitizenRegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email'] 