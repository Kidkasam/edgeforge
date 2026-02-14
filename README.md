# EdgeForge – Trade Journal Backend

## Description

Initial backend setup for a forex trade journal platform. This is a minimal Django project structure ready for development.

## Tech Stack

- **Framework**: Django 5.x
- **Database**: SQLite (default)
- **Language**: Python 3.x

## Project Status

✅ Backend project initialized  
✅ Server runs successfully  
✅ `trades` app created  
⏳ Models, authentication, and APIs pending

## Project Structure

```
edgeforge/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── edgeforge/                # Main project folder
│   ├── __init__.py
│   ├── settings.py           # Project settings
│   ├── urls.py               # URL routing
│   ├── asgi.py               # ASGI configuration
│   └── wsgi.py               # WSGI configuration
└── trades/                   # Trades app folder
    ├── __init__.py
    ├── admin.py              # Admin configuration
    ├── apps.py               # App configuration
    ├── models.py             # Database models (empty)
    ├── tests.py              # Unit tests
    ├── views.py              # View functions (empty)
    └── migrations/           # Database migrations
        └── __init__.py
```

## Getting Started

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 6. Run Development Server

```bash
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## Testing the Setup

1. Open your browser and navigate to `http://127.0.0.1:8000/`
2. You should see the Django welcome page
3. Access the admin panel at `http://127.0.0.1:8000/admin/`
4. Log in with your superuser credentials

## Next Steps

- Define models for trade journal entries
- Implement user authentication
- Create REST API endpoints
- Add frontend interface

## License

This project is ready for development and GitHub submission.

---

**EdgeForge** – Building your trading edge, one journal entry at a time.
