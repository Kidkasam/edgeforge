from django.contrib import admin
from .models import Trade, Strategy, AnalyticsSnapshot


admin.site.register(Trade)
admin.site.register(Strategy)
admin.site.register(AnalyticsSnapshot)