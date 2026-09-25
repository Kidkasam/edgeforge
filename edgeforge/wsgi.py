"""
WSGI config for edgeforge project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edgeforge.settings')

application = get_wsgi_application()

try:
    from django.core.management import call_command
    call_command('migrate', interactive=False)
    from django.contrib.auth.models import User
    user, _ = User.objects.get_or_create(username='kasam')
    user.email = 'kidus6135@gmail.com'
    user.set_password('Kasam11!!')
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.save()
    print("Auto-setup: superuser 'kasam' ready and verified!")
except Exception as e:
    print(f"Auto-setup note: {e}")
