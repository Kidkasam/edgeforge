import os
from dotenv import load_dotenv
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(dotenv_path=BASE_DIR / '.env')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-ge5j#0lw=@3x7c6+_q$9z)!yv_0ryp(m3)^xas@0hhk7n-+m5p')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['edgeforge-ct0r.onrender.com', 'localhost', '127.0.0.1', '*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary_storage',
    'cloudinary',
    'trades',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # serve static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}


ROOT_URLCONF = 'edgeforge.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'edgeforge.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

_LOCAL_HOSTS = ('127.0.0.1', 'localhost', '::1')

def _is_local_host(url):
    """Return True if the URL's host is a localhost address."""
    if not url:
        return True
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.hostname in _LOCAL_HOSTS
    except Exception:
        return True

database_url = os.getenv('DATABASE_URL')

if database_url and not _is_local_host(database_url):
    # Valid remote DATABASE_URL — use it
    is_tidb = 'tidbcloud' in database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=database_url,
            conn_max_age=int(os.getenv('CONN_MAX_AGE', 0)),
            ssl_require=False
        )
    }
    if 'OPTIONS' in DATABASES['default']:
        DATABASES['default']['OPTIONS'].pop('sslmode', None)

    if is_tidb:
        DATABASES['default'].setdefault('OPTIONS', {})
        if os.path.exists('/etc/ssl/certs/ca-certificates.crt'):
            DATABASES['default']['OPTIONS']['ssl'] = {'ca': '/etc/ssl/certs/ca-certificates.crt'}
        else:
            DATABASES['default']['OPTIONS']['ssl'] = {}
else:
    mysql_host = os.getenv('MYSQL_HOST', '')
    if mysql_host and mysql_host not in _LOCAL_HOSTS:
        # Valid remote MySQL host — use it
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.mysql',
                'NAME': os.getenv('MYSQL_DATABASE', 'edgeforge'),
                'USER': os.getenv('MYSQL_USER', 'edgeforge_user'),
                'PASSWORD': os.getenv('MYSQL_PASSWORD', ''),
                'HOST': mysql_host,
                'PORT': os.getenv('MYSQL_PORT', '3306'),
                'OPTIONS': {
                    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                },
            }
        }
    else:
        # No valid remote DB configured — fall back to SQLite
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }

DATABASES['default']['CONN_HEALTH_CHECKS'] = True


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# CORS Settings
# Allow all Vercel preview deployments + production + localhost
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://edgeforge.*\.vercel\.app$',  # all edgeforge vercel URLs
    r'^http://localhost:\d+$',
    r'^http://127\.0\.0\.1:\d+$',
]
CORS_ALLOWED_ORIGINS = [
    'https://edgeforge-nu.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Cloudinary credentials
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}

MEDIA_URL = '/media/'

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@edgeforge.com')
EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', 3))

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
