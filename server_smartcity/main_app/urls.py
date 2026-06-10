from django.urls import path
from .views import (
    home,
    ReportListView,
    ReportDetailView,
    report_search,
    report_detail_json,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportUpdateStatusView
)

urlpatterns = [
    path('', home, name='home'),
    path('reports/', ReportListView.as_view(), name='report_list'),
    path('reports/search/', report_search, name='report_search'),
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('report/<int:pk>/json/', report_detail_json, name='report_detail_json'),
    path('add/', ReportCreateView.as_view(), name='add_report'),
    path('update/<int:pk>/', ReportUpdateView.as_view(), name='update_report'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='delete_report'),
    path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='update_status'),
]