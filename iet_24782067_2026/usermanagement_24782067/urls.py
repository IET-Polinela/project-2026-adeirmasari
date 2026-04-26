from django.urls import path
# Import class yang sudah kita buat sendiri di views.py
from .views import UserLoginView, UserLogoutView, register 

urlpatterns = [
    path(
        'login/',
        UserLoginView.as_view(),
        name='login'
    ),
    path(
        'logout/',
        UserLogoutView.as_view(),
        name='logout'
    ),
    path(
        'register/',
        register,
        name='register'
    ),
]