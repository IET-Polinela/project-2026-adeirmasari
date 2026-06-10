from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib import messages
from django.urls import reverse_lazy
from django.shortcuts import render, redirect
from .forms import CitizenRegisterForm

class UserLoginView(SuccessMessageMixin, LoginView):
    template_name = 'login.html'
    success_message = "Selamat Datang! Anda berhasil login." # Pesan Login

class UserLogoutView(LogoutView):
    next_page = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        # Berikan pesan sebelum proses logout selesai
        messages.info(request, "Anda telah berhasil logout.")
        return super().dispatch(request, *args, **kwargs)

def register(request):
    # ... kode register Anda yang sudah ada ...
    if request.method == 'POST':
        form = CitizenRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_admin = False
            user.is_member = True
            user.save()
            messages.success(request, "Registrasi berhasil, silakan login")
            return redirect('login')
    else:
        form = CitizenRegisterForm()
    return render(request, 'register.html', {'form': form})