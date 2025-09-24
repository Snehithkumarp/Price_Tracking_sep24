# ============================================
# 🔹 Django Management Command: scrape_products
# ============================================
# Purpose: Scrape product(s) from Amazon/Flipkart, update DB, and send alerts
# Usage: python manage.py scrape_products <url1> <url2> ...
# ============================================

from django.core.management.base import BaseCommand
from PriceTrack.tasks.scraper import scrape_product
from PriceTrack.models import Product, PriceHistory, PriceAlert
from PriceTrack.utils.email_notifications import send_price_alert
from decimal import Decimal, InvalidOperation
from PriceTrack.utils.affiliate import make_amazon_affiliate
import re

class Command(BaseCommand):
    help = "Scrape product(s) from Amazon/Flipkart and update DB with prices"

    # -------------------------
    # Define command-line args
    # -------------------------
    def add_arguments(self, parser):
        parser.add_argument(
            "urls", nargs="+", type=str, help="Product URLs (Amazon/Flipkart)"
        )

    # -------------------------
    # Main command logic
    # -------------------------
    def handle(self, *args, **kwargs):
        urls = kwargs["urls"]

        for url in urls:
            self.stdout.write(f"🔎 Scraping {url}...")

            # --- Scrape product data ---
            data = scrape_product(url)

            if not data or not data.get("price"):
                self.stdout.write(self.style.ERROR(f"❌ Failed to scrape {url}"))
                continue

            # --- Clean and parse price ---
            raw_price = str(data.get("price"))
            clean_price = re.sub(r"[^\d.]", "", raw_price)  # keep only digits + decimal

            try:
                price = Decimal(clean_price)
            except (InvalidOperation, TypeError):
                self.stdout.write(self.style.ERROR(f"⚠️ Invalid price format: {raw_price}"))
                continue

            # --- Save or update Product in DB ---
            affiliate_url = make_amazon_affiliate(url)
            # print(f"DEBUG Affiliate URL: {affiliate_url}")
        
            product, created = Product.objects.update_or_create(
                url=url,
                defaults={
                    "name": data.get("name") or "Unknown Product",
                    "image": data.get("image") or "",
                    "current_price": price,
                    "currency": "₹",
                    "affiliate_url": affiliate_url,
                },
            )

            # --- Add Price History entry ---
            PriceHistory.objects.create(product=product, price=price)

            # --- Output to console ---
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Added {product.name} - ₹{price}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"🔄 Updated {product.name} - ₹{price}"))

            # --- Check and trigger alerts ---
            alerts = PriceAlert.objects.filter(product=product, active=True)
            for alert in alerts:
                if product.current_price <= alert.threshold:
                    # Send email notification
                    send_price_alert(
                        alert.user.email,
                        product.name,
                        product.current_price,
                        url,
                    )
                    # Deactivate alert after sending
                    alert.active = False
                    alert.save()
                    self.stdout.write(
                        self.style.WARNING(f"📩 Price alert sent to {alert.user.email}")
                    )
