from django.urls import path
from .views import DashboardView, dashboard_stats

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('stats/', dashboard_stats, name='dashboard_stats'),
]