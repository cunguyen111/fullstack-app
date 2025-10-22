"""djangoproj URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
# djangoproj/urls.py
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import TemplateView

# 💡 Import view để map alias trực tiếp
from djangoapp import views as app_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Alias không prefix để front-end gọi thẳng
    path('reviews/dealer/<int:dealer_id>', app_views.get_dealer_reviews),

    # (tuỳ chọn) các alias khác nếu front-end gọi không có /djangoapp/
    path('get_dealers/', app_views.get_dealerships),
    path('get_dealers/<str:state>', app_views.get_dealerships),
    path('dealer/<int:dealer_id>/details', app_views.get_dealer_details),

    # Giữ nguyên mount gốc để không phá vỡ API đã có
    path('djangoapp/', include('djangoapp.urls')),

    # Các trang
    path('', TemplateView.as_view(template_name="Home.html")),
    path('about/', TemplateView.as_view(template_name="About.html")),
    path('contact/', TemplateView.as_view(template_name="Contact.html")),
    path('login/', TemplateView.as_view(template_name="index.html")),
    path('register/', TemplateView.as_view(template_name="index.html")),
    path('dealers/', TemplateView.as_view(template_name="index.html")),
    path('dealer/<int:dealer_id>', TemplateView.as_view(template_name="index.html")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

