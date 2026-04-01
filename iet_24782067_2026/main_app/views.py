from django.shortcuts import render, redirect
from .models import Report
from .forms import ReportForm

def add_report(request):
    if request.method == "POST":
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = ReportForm()

    return render(request, 'main_app/add_report.html', {'form': form})