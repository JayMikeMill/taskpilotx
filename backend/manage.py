#!/usr/bin/env python
# ---------------------------------------------
# Django manage.py commands for TaskPilotX
# ---------------------------------------------

# 1. Make migrations for your apps (detect changes in models.py)
# python manage.py makemigrations

# 2. Apply migrations to the database (create tables in PostgreSQL)
# python manage.py migrate

# 3. Create a superuser (for accessing Django admin panel)
# python manage.py createsuperuser
# Follow prompts: username, email, password

# 4. Run the development server (start backend locally)
# python manage.py runserver
# Backend URL: http://127.0.0.1:8000/
# GraphQL endpoint: http://127.0.0.1:8000/graphql/
# Admin panel: http://127.0.0.1:8000/admin/

# 5. Check project for errors
# python manage.py check

# 6. Open Django shell (for testing models and queries manually)
# python manage.py shell

# 7. List all available manage.py commands
# python manage.py help

# 8. Reset database migrations and clear data (use carefully!)
# python manage.py flush

import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskpilotx.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
