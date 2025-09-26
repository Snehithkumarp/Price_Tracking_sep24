# ============================================
# 🔹 Django Management Command: scrape_products
# ============================================
# Purpose: Scrape product(s) from Amazon/Flipkart, update DB, and send alerts
# Usage: python manage.py scrape_products <url1> <url2> ...
# ============================================

import re
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand
from PriceTrack.tasks.scraper import scrape_product, clean_flipkart_url, clean_amazon_url
from PriceTrack.models import Product, PriceHistory, TrackedProduct
from PriceTrack.utils.email_notifications import send_price_alert
from PriceTrack.utils.affiliate import make_amazon_affiliate

class Command(BaseCommand):
    help = "Scrape product(s) from Amazon/Flipkart and update DB with prices"

    # -------------------------
    # Define command-line args
    # -------------------------
    def add_arguments(self, parser):
        parser.add_argument(
            "urls", nargs="*", type=str, help="Product URLs (Amazon/Flipkart)"
        )

    # -------------------------
    # Main command logic
    # -------------------------
    def handle(self, *args, **kwargs):
        urls = kwargs["urls"]

        # If no URLs are provided, scrape all products in DB
        if not urls:
            # Fetch all non-empty URLs from DB
            urls = list(Product.objects.filter(product_url__isnull=False).exclude(product_url="").values_list("product_url", flat=True))
            self.stdout.write(f"ℹ️ No URLs provided. Scraping all {len(urls)} products from DB...")


        for url in urls:
            self.stdout.write(f"🔎 Scraping {url}...")

            # Clean URL
            if "amazon" in url:
                url = clean_amazon_url(url)
            elif "flipkart" in url:
                url = clean_flipkart_url(url)

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

            # Parse price
            # try:
            #     price = Decimal(re.sub(r"[^\d.]", "", str(data.get("price"))))
            # except (InvalidOperation, TypeError):
            #     self.stdout.write(self.style.ERROR(f"⚠️ Invalid price format: {data.get('price')}"))
            #     continue



            # --- Save or update Product in DB ---
            affiliate_url = make_amazon_affiliate(url)
            # print(f"DEBUG Affiliate URL: {affiliate_url}")
        
            product, created = Product.objects.update_or_create(
                product_url=url,
                defaults={
                    "title": data.get("name") or "Unknown Product",
                    "image_url": data.get("image") or "",
                    "current_price": price,
                    "currency": "₹",
                    "affiliate_url": affiliate_url,
                },
            )
            if not created:
                # Update price if needed
                if product.current_price != price:
                    product.current_price = price
                    product.save()

            # Save price history
            PriceHistory.objects.create(product=product, price=price)

            # --- Output to console ---
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Added {product.title} - ₹{price}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"🔄 Updated {product.title} - ₹{price}"))

            # --- Check and trigger alerts ---
            alerts = TrackedProduct.objects.filter(product=product, active=True)
            for alert in alerts:
                if alert.threshold and product.current_price <= alert.threshold:
                    # Send email notification
                    send_price_alert(
                        alert.user.email,
                        product.title,
                        product.current_price,
                        url,
                    )
                    if alert.repeat_alerts:
                        self.stdout.write(
                        self.style.WARNING(f"📩 Repeat alert sent to {alert.user.email}")
                    )
                    else:
                        # Deactivate alert after sending
                        alert.active = False # ❓ or keep True if you want repeat alerts
                        alert.save()
                        self.stdout.write(
                            self.style.WARNING(f"📩 Price alert sent to {alert.user.email}")
                        )
