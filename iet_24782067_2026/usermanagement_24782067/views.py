from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.urls import reverse_lazy
from django.shortcuts import render, redirect
from .forms import CitizenRegisterForm


class UserLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        messages.success(self.request, "Login berhasil")
        return super().form_valid(form)


class UserLogoutView(LogoutView):
    next_page = reverse_lazy('login')


def register(request):
    if request.method == 'POST':
        form = CitizenRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_admin = False     # PAKSA Citizen bukan admin
            user.is_member = True
            user.save()

            messages.success(request, "Registrasi berhasil, silakan login")
            return redirect('login')
    else:
        form = CitizenRegisterForm()

    return render(request, 'registration/register.html', {'form': form})