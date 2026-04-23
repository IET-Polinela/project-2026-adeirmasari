from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.urls import reverse_lazy

class UserLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        messages.success(self.request, "Login berhasil")
        return super().form_valid(form)

class UserLogoutView(LogoutView):
    next_page = reverse_lazy('login')