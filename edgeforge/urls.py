from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "project": "EdgeForge Sovereign Performance Engine",
        "status": "Online",
        "admin_panel": "/admin/",
        "api_documentation": "/api/",
        "frontend": "https://edgeforge-nu.vercel.app"
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('trades.urls')),
]