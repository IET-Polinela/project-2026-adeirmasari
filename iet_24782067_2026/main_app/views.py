from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Q
from .models import Report
from .forms import ReportForm
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# --- HOME ---
# Menangani path('', home, name='home')
def home(request):
    return render(request, 'main_app/home.html')

# --- READ (LIST) ---
# Menangani path('reports/', ReportListView.as_view(), name='report_list')
class ReportListView(LoginRequiredMixin, ListView):
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'
    ordering = ['-id']

    def get_queryset(self):
        return Report.objects.exclude(status='DRAFT').order_by('-id')

# --- DETAIL ---
# Menangani path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail')
class ReportDetailView(LoginRequiredMixin, DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'

@login_required
def report_search(request):
    query = request.GET.get('q', '').strip()
    reports = Report.objects.all()
    if query:
        reports = reports.filter(
            Q(title__icontains=query) |
            Q(category__icontains=query) |
            Q(location__icontains=query) |
            Q(description__icontains=query)
        )
    
    # TAMBAHKAN 'category' di dalam .values() agar saat dirender ulang via JS, kolom kategori tidak hilang
    reports = reports.order_by('-id').values('id', 'title', 'location', 'status', 'category')[:100]
    return JsonResponse({'reports': list(reports)})

@login_required
def report_detail_json(request, pk):
    report = get_object_or_404(Report, pk=pk)
    return JsonResponse({
        'id': report.id,
        'title': report.title,
        'category': report.category,
        'location': report.location,
        'description': report.description,
        'status': report.status,
        'created_at': report.created_at.strftime('%d %B %Y %H:%M'),
    })

# --- CREATE ---
# Menangani path('add/', ReportCreateView.as_view(), name='add_report')
class ReportCreateView(LoginRequiredMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def dispatch(self, request, *args, **kwargs):
        # Proteksi Admin
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Hanya Admin yang boleh menambah laporan.")
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, "Laporan baru berhasil ditambahkan!")
        return super().form_valid(form)

# --- UPDATE ---
# Menangani path('update/<int:pk>/', ReportUpdateView.as_view(), name='update_report')
class ReportUpdateView(LoginRequiredMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/update_report.html'
    success_url = reverse_lazy('report_list')

    def dispatch(self, request, *args, **kwargs):
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Hanya Admin yang boleh mengubah laporan.")
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diperbarui.")
        return super().form_valid(form)

# --- DELETE ---
# Menangani path('delete/<int:pk>/', ReportDeleteView.as_view(), name='delete_report')
class ReportDeleteView(LoginRequiredMixin, DeleteView):
    model = Report
    template_name = 'main_app/delete.html'
    success_url = reverse_lazy('report_list')

    def dispatch(self, request, *args, **kwargs):
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Hanya Admin yang boleh menghapus laporan.")
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        messages.success(request, "Laporan berhasil dihapus.")
        return super().post(request, *args, **kwargs)

# --- WORKFLOW STATUS UPDATE ---
# Menangani path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='update_status')
class ReportUpdateStatusView(LoginRequiredMixin, View):
    def post(self, request, pk):
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Hanya Admin yang bisa merubah status.")
            return redirect('report_list')

        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        # Validasi Alur Status
        valid_transition = False
        
        if report.status == 'REPORTED' and new_status == 'VERIFIED':
            report.status = 'VERIFIED'
            messages.success(request, "Laporan berhasil diverifikasi.")
            valid_transition = True
        elif report.status == 'VERIFIED' and new_status == 'IN_PROGRESS':
            report.status = 'IN_PROGRESS'
            messages.success(request, "Laporan sekarang dalam proses pengerjaan.")
            valid_transition = True
        elif report.status == 'IN_PROGRESS' and new_status == 'RESOLVED':
            report.status = 'RESOLVED'
            messages.success(request, "Laporan telah ditandai sebagai selesai.")
            valid_transition = True
        
        if not valid_transition:
            messages.error(request, "Perubahan status tidak valid atau tidak sesuai urutan.")
        else:
            report.save()

        return redirect('report_list')