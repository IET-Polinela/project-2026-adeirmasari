from django.views.generic import TemplateView
from django.http import JsonResponse


def dashboard_stats(request):
    data = {
        'total_user': 120,
        'total_admin': 5,
        'total_citizen': 100,
        'total_guest': 15
    }
    return JsonResponse(data)

class DashboardView(TemplateView):
    template_name = 'dashboard.html'