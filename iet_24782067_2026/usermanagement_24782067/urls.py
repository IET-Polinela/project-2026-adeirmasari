from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path
from .views import register

urlpatterns = [
    path(
        'login/',
        LoginView.as_view(template_name='registration/login.html'),
        name='login'
    ),
    path(
        'logout/',
        LogoutView.as_view(),
        name='logout'
    ),
    path(
        'register/',
        register,
        name='register'
    ),
]