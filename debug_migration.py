import os
import django
import sys
from django.core.management import call_command

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edgeforge.settings')
django.setup()

print("Attempting to run migrations for 'trades'...")
with open('migration_traceback.txt', 'w') as f:
    try:
        call_command('migrate', 'trades')
        f.write("Migration successful!")
    except Exception:
        import traceback
        traceback.print_exc(file=f)
print("Done. Check migration_traceback.txt")
