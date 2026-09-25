from django.db import migrations

def create_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    from django.contrib.auth.hashers import make_password
    pwd = make_password('Kasam11!!')
    user, created = User.objects.get_or_create(
        username='kasam',
        defaults={
            'email': 'kidus6135@gmail.com',
            'password': pwd,
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
        }
    )
    if not created:
        user.password = pwd
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('trades', '0008_alter_emailverification_token'),
    ]

    operations = [
        migrations.RunPython(create_admin),
    ]