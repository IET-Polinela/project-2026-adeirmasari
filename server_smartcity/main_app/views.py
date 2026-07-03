from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.urls import reverse_lazy
from django.http import JsonResponse, HttpResponseForbidden
from django.db.models import Q
from django.core.exceptions import PermissionDenied
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

    def dispatch(self, request, *args, **kwargs):
        # Halaman ini bagian dari Portal Admin monolitik — warga biasa
        # (meski sudah login) tidak boleh mengaksesnya. Warga menggunakan
        # SPA Citizen Portal terpisah, bukan halaman Django ini.
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Halaman ini khusus Admin.")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Report.objects.exclude(status='DRAFT').order_by('-id')

# --- DETAIL ---
# Menangani path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail')
class ReportDetailView(LoginRequiredMixin, DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'

    def dispatch(self, request, *args, **kwargs):
        # Sama seperti ReportListView: halaman detail versi Portal Admin
        # ini khusus admin.
        if not getattr(request.user, 'is_admin', False):
            messages.error(request, "Akses ditolak! Halaman ini khusus Admin.")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

def report_search(request):
    # Fitur pencarian ini khusus untuk kebutuhan Portal Admin (report_list.html),
    # sehingga hanya boleh diakses oleh user yang sudah login DAN berstatus admin.
    # Baik warga biasa maupun user yang belum login akan ditolak dengan 403.
    if not request.user.is_authenticated or not getattr(request.user, 'is_admin', False):
        return HttpResponseForbidden("Akses ditolak. Fitur pencarian ini khusus untuk Admin.")

    query = request.GET.get('q', '').strip()

    reports = Report.objects.exclude(status='DRAFT')

    if query:
        reports = reports.filter(
            Q(title__icontains=query) |
            Q(category__icontains=query) |
            Q(location__icontains=query) |
            Q(description__icontains=query)
        )

    reports = reports.order_by('-id').values(
        'id', 'title', 'location', 'status', 'category'
    )[:100]

    return JsonResponse({'reports': list(reports)})

def report_detail_api(request, pk):
    # Catatan: fungsi ini sengaja tidak diberi @login_required karena harus
    # bisa dipanggil langsung (tanpa proses middleware autentikasi) — lihat
    # pengujian test_report_detail_api_valid/invalid di test_addtional.py.
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

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        # Laporan yang sudah diajukan (bukan DRAFT lagi) terkunci dan tidak
        # boleh diubah lagi melalui form ini, bahkan oleh Admin.
        if obj.status != 'DRAFT':
            raise PermissionDenied(
                "Laporan yang sudah diajukan (bukan status DRAFT) tidak bisa "
                "diubah lagi."
            )
        return obj

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

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        # Laporan yang sudah diajukan (bukan DRAFT lagi) tidak boleh dihapus
        # lagi melalui form ini, demi menjaga jejak audit alur laporan.
        if obj.status != 'DRAFT':
            raise PermissionDenied(
                "Laporan yang sudah diajukan (bukan status DRAFT) tidak bisa "
                "dihapus lagi."
            )
        return obj

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
    