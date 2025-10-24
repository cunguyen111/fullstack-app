# djangoproj/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import TemplateView

# Alias trực tiếp tới view để frontend có thể gọi
# /reviews/dealer/<id> mà không cần /djangoapp/
from djangoapp import views as app_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # ===== API aliases (không prefix) =====
    # Cho phép JS gọi thẳng /reviews/dealer/<id>
    path('reviews/dealer/<int:dealer_id>', app_views.get_dealer_reviews,
         name='dealer_reviews_alias'),
    # Thêm alias chi tiết dealer, tránh đụng trang /dealer/<id> dùng cho SPA
    path('dealer/<int:dealer_id>/details', app_views.get_dealer_details,
         name='dealer_details_alias'),
    path('get_dealers/', app_views.get_dealerships,
         name='get_dealers_alias'),
    path('get_dealers/<str:state>', app_views.get_dealerships,
         name='get_dealers_by_state_alias'),
    path('postreview/<int:dealer_id>',
         TemplateView.as_view(template_name="index.html")),
    # ===== Mount gốc của app dưới /djangoapp/ (API “chính thức”) =====
    path('djangoapp/', include('djangoapp.urls')),

    # ===== Pages (SPA/Template) =====
    path('', TemplateView.as_view(template_name="Home.html")),
    path('about/', TemplateView.as_view(template_name="About.html")),
    path('contact/', TemplateView.as_view(template_name="Contact.html")),
    path('login/', TemplateView.as_view(template_name="index.html")),
    path('register/', TemplateView.as_view(template_name="index.html")),
    path('dealers/', TemplateView.as_view(template_name="index.html")),
    path('dealer/<int:dealer_id>',
         TemplateView.as_view(template_name="index.html")),

    # (Tuỳ chọn) Manifest để khỏi 404 nếu bạn có file templates/manifest.json
    # re_path(r'^manifest\.json$', TemplateView.as_view(
    #     template_name="manifest.json", content_type='application/json')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
