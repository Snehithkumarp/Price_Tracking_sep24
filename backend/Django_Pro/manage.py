#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.
This file allows you to run commands like:
    - python manage.py runserver
    - python manage.py migrate
    - python manage.py createsuperuser
"""

import os
import sys

def main():
    """Run administrative tasks."""
    
    # ---------------------------
    # Set default Django settings
    # ---------------------------
    # If the DJANGO_SETTINGS_MODULE environment variable isn't set,
    # default to the settings module of this project.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Django_Pro.settings')

    try:
        # Import Django's command-line utility
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Error message if Django isn't installed or virtual environment isn't active
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Execute the command line utility with arguments (e.g., runserver, migrate)
    execute_from_command_line(sys.argv)


# Entry point of the script
if __name__ == '__main__':
    main()
