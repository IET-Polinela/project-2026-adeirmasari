from django.shortcuts import render, redirect
from .models import Report
from .forms import ReportForm


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


# READ
def report_list(request):
    reports = Report.objects.all()
    return render(request, 'main_app/report_list.html', {'reports': reports})


# UPDATE
def update_report(request, id):
    report = Report.objects.get(id=id)

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
    report = Report.objects.get(id=id)
    report.delete()
    return redirect('report_list')