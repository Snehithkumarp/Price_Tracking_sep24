# ============================================
# 🔹 Django Management Command: list_urls
# ============================================
# Purpose: Print all registered URL patterns in your project
# Usage: python manage.py list_urls
# ============================================

from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = "List all registered URLs"  # Description of the command

    # The main entry point of the command
    def handle(self, *args, **kwargs):
        # get_resolver() returns the root URL resolver for the project
        # .url_patterns contains all top-level URL patterns
        urls = get_resolver().url_patterns

        # Iterate through each URL pattern and print it
        for url in urls:
            self.stdout.write(str(url))
