from django.views.generic import TemplateView
from django.http import JsonResponse
from main_app.models import Report
from django.db.models import Count


class DashboardView(TemplateView):
    template_name = 'dashboard/dashboard.html'


def dashboard_stats(request):
    total_reports = Report.objects.count()

    # Distribusi status (total + persentase)
    status_data = list(
        Report.objects
        .values('status')
        .annotate(total=Count('id'))
        .order_by('status')
    )
    for item in status_data:
        item['percent'] = round((item['total'] / total_reports) * 100, 1) if total_reports else 0

    # Distribusi kategori
    category_data = list(
        Report.objects
        .values('category')
        .annotate(total=Count('id'))
        .order_by('category')
    )

    # 5 laporan terakhir REPORTED
    reported_latest = list(
        Report.objects
        .filter(status='REPORTED')
        .order_by('-created_at')[:5]
        .values('title', 'category', 'location')
    )

    # 5 laporan terakhir RESOLVED
    resolved_latest = list(
        Report.objects
        .filter(status='RESOLVED')
        .order_by('-created_at')[:5]
        .values('title', 'category', 'location')
    )

    return JsonResponse({
        'status': status_data,
        'category': category_data,
        'reported': reported_latest,
        'resolved': resolved_latest,
    })