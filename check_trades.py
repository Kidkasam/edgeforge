import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edgeforge.settings')
django.setup()

from trades.models import Trade
trades = Trade.objects.exclude(screenshot='').exclude(screenshot__isnull=True)
for t in trades:
    print(f"ID: {t.id} - URL: {t.screenshot.url}")
