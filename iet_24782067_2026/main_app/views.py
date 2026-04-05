from django.shortcuts import render, redirect, get_object_or_404
from .models import Report
from .forms import ReportForm


# HOME (halaman awal)
def home(request):
    return render(request, 'main_app/home.html')


# READ (tampilkan semua data)
def report_list(request):
    reports = Report.objects.all()
    return render(request, 'main_app/report_list.html', {'reports': reports})


# CREATE
def add_report(request):
    if request.method == "POST":
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('report_list')
    else:
        form = ReportForm()

    return render(request, 'main_app/add_report.html', {'form': form})


# UPDATE
def update_report(request, id):
    report = get_object_or_404(Report, id=id)

    if request.method == "POST":
        form = ReportForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            return redirect('report_list')
    else:
        form = ReportForm(instance=report)

    return render(request, 'main_app/update_report.html', {'form': form})


# DELETE
def delete_report(request, id):
    report = get_object_or_404(Report, id=id)

    if request.method == "POST":
        report.delete()
        return redirect('report_list')

    return render(request, 'main_app/delete.html', {'report': report})