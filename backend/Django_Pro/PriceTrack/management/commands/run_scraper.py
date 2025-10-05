# # ============================================
# # 🔹 Django Management Command: scrape_products
# # ============================================
# # Purpose: Scrape product(s) from Amazon/Flipkart, update DB, and send alerts
# # Usage: python manage.py scrape_products <url1> <url2> ...
# # ============================================

# import re
# from decimal import Decimal, InvalidOperation
# from django.core.management.base import BaseCommand
# from PriceTrack.tasks.scraper import scrape_product, clean_flipkart_url, clean_amazon_url
# from PriceTrack.models import Product, PriceHistory, TrackedProduct
# from PriceTrack.utils.email_notifications import send_price_alert
# from PriceTrack.utils.affiliate import make_amazon_affiliate

# class Command(BaseCommand):
#     help = "Scrape product(s) from Amazon/Flipkart and update DB with prices"

#     # -------------------------
#     # Define command-line args
#     # -------------------------
#     def add_arguments(self, parser):
#         parser.add_argument(
#             "urls", nargs="*", type=str, help="Product URLs (Amazon/Flipkart)"
#         )

#     # -------------------------
#     # Main command logic
#     # -------------------------
#     def handle(self, *args, **kwargs):
#         urls = kwargs["urls"]

#         # If no URLs are provided, scrape all products in DB
#         if not urls:
#             # Fetch all non-empty URLs from DB
#             urls = list(Product.objects.filter(product_url__isnull=False).exclude(product_url="").values_list("product_url", flat=True))
#             self.stdout.write(f"ℹ️ No URLs provided. Scraping all {len(urls)} products from DB...")


#         for url in urls:
#             self.stdout.write(f"🔎 Scraping {url}...")

#             # Clean URL
#             if "amazon" in url:
#                 url = clean_amazon_url(url)
#             elif "flipkart" in url:
#                 url = clean_flipkart_url(url)

#             # --- Scrape product data ---
#             data = scrape_product(url)

#             if not data or not data.get("price"):
#                 self.stdout.write(self.style.ERROR(f"❌ Failed to scrape {url}"))
#                 continue

#             # --- Clean and parse price ---
#             raw_price = str(data.get("price"))
#             clean_price = re.sub(r"[^\d.]", "", raw_price)  # keep only digits + decimal

#             try:
#                 price = Decimal(clean_price)
#             except (InvalidOperation, TypeError):
#                 self.stdout.write(self.style.ERROR(f"⚠️ Invalid price format: {raw_price}"))
#                 continue

#             # Parse price
#             # try:
#             #     price = Decimal(re.sub(r"[^\d.]", "", str(data.get("price"))))
#             # except (InvalidOperation, TypeError):
#             #     self.stdout.write(self.style.ERROR(f"⚠️ Invalid price format: {data.get('price')}"))
#             #     continue



#             # --- Save or update Product in DB ---
#             affiliate_url = make_amazon_affiliate(url)
#             # print(f"DEBUG Affiliate URL: {affiliate_url}")
        
#             product, created = Product.objects.update_or_create(
#                 product_url=url,
#                 defaults={
#                     "title": data.get("name") or "Unknown Product",
#                     "image_url": data.get("image") or "",
#                     "current_price": price,
#                     "currency": "₹",
#                     "affiliate_url": affiliate_url,
#                 },
#             )
#             if not created:
#                 # Update price if needed
#                 if product.current_price != price:
#                     product.current_price = price
#                     product.save()

#             # Save price history
#             PriceHistory.objects.create(product=product, price=price)

#             # --- Output to console ---
#             if created:
#                 self.stdout.write(self.style.SUCCESS(f"✅ Added {product.title} - ₹{price}"))
#             else:
#                 self.stdout.write(self.style.SUCCESS(f"🔄 Updated {product.title} - ₹{price}"))

#             # --- Check and trigger alerts ---
#             alerts = TrackedProduct.objects.filter(product=product, active=True)
#             for alert in alerts:
#                 if alert.threshold and product.current_price <= alert.threshold:
#                     # Send email notification
#                     send_price_alert(
#                         alert.user.email,
#                         product.title,
#                         product.current_price,
#                         url,
#                     )
#                     if alert.repeat_alerts:
#                         self.stdout.write(
#                         self.style.WARNING(f"📩 Repeat alert sent to {alert.user.email}")
#                     )
#                     else:
#                         # Deactivate alert after sending
#                         alert.active = False # ❓ or keep True if you want repeat alerts
#                         alert.save()
#                         self.stdout.write(
#                             self.style.WARNING(f"📩 Price alert sent to {alert.user.email}")
#                         )


# PriceTrack/management/commands/run_scraper.py
# ============================================
# 🔹 Django Management Command: run_scraper
# ============================================
# Purpose: Scrape product(s) from Amazon/Flipkart, update DB, and send alerts
# Usage: python manage.py run_scraper <url1> <url2> ...
# ============================================

import re
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand
from PriceTrack.tasks.scraper import scrape_product, clean_flipkart_url, clean_amazon_url
from PriceTrack.models import Product, PriceHistory, TrackedProduct
from PriceTrack.utils.email_notifications import send_price_alert
from PriceTrack.utils.affiliate import make_affiliate_link

class Command(BaseCommand):
    help = "Scrape product(s) from Amazon/Flipkart and update DB with prices"

    def add_arguments(self, parser):
        parser.add_argument(
            "urls", nargs="*", type=str, help="Product URLs (Amazon/Flipkart)"
        )
        parser.add_argument(
            "--deduplicate",
            action="store_true",
            help="Remove duplicate URLs before processing",
        )
        parser.add_argument(
            "--search",
            type=str,
            help="Search for products by keyword instead of using URLs",
        )
        parser.add_argument(
            "--max-results",
            type=int,
            default=5,
            help="Maximum number of results for search (default: 5)",
        )

    def handle(self, *args, **kwargs):
        urls = kwargs["urls"]
        deduplicate = kwargs["deduplicate"]
        search_query = kwargs["search"]
        max_results = kwargs["max_results"]

        # Handle search mode
        if search_query:
            self.stdout.write(f"🔍 Searching for: '{search_query}'")
            urls = self._handle_search(search_query, max_results)
            if not urls:
                self.stdout.write(self.style.ERROR("❌ No products found from search"))
                return

        # If no URLs are provided and no search, scrape all products in DB
        if not urls:
            urls = list(Product.objects.filter(product_url__isnull=False)
                       .exclude(product_url="")
                       .values_list("product_url", flat=True))
            self.stdout.write(f"ℹ️ No URLs provided. Scraping all {len(urls)} products from DB...")

        # Remove duplicates if requested
        if deduplicate:
            unique_urls = list(set(urls))
            removed_count = len(urls) - len(unique_urls)
            if removed_count > 0:
                self.stdout.write(f"🔄 Removed {removed_count} duplicate URLs")
                urls = unique_urls

        success_count = 0
        fail_count = 0
        alert_count = 0

        for i, url in enumerate(urls, 1):
            self.stdout.write(f"\n[{i}/{len(urls)}] 🔎 Scraping: {url}")

            # Clean URL first
            if "amazon" in url:
                clean_url = clean_amazon_url(url)
            elif "flipkart" in url:
                clean_url = clean_flipkart_url(url)
            else:
                clean_url = url
                self.stdout.write(self.style.WARNING(f"⚠️ Unknown site for URL: {url}"))

            # --- Scrape product data ---
            data = scrape_product(clean_url)

            if not data or "error" in data or not data.get("price"):
                error_msg = data.get("error", "Unknown error") if data else "No data returned"
                self.stdout.write(self.style.ERROR(f"❌ Failed to scrape: {error_msg}"))
                fail_count += 1
                continue

            # --- Clean and parse price ---
            raw_price = str(data.get("price"))
            clean_price = re.sub(r"[^\d.]", "", raw_price)

            try:
                price = Decimal(clean_price)
            except (InvalidOperation, TypeError):
                self.stdout.write(self.style.ERROR(f"⚠️ Invalid price format: {raw_price}"))
                fail_count += 1
                continue

            # --- Generate affiliate link ---
            affiliate_url = make_affiliate_link(clean_url)
            if not affiliate_url or affiliate_url == clean_url:
                self.stdout.write(self.style.WARNING("⚠️ Could not generate affiliate link"))
                affiliate_url = clean_url

            # --- Save or update Product in DB ---
            try:
                product, created = Product.objects.update_or_create(
                    product_url=clean_url,
                    defaults={
                        "title": data.get("name") or "Unknown Product",
                        "image_url": data.get("image") or "",
                        "current_price": price,
                        "currency": "₹",
                        "affiliate_url": affiliate_url,
                        "site": data.get("site", "unknown"),
                    },
                )

                # Save price history (always create new entry)
                PriceHistory.objects.create(product=product, price=price)

                # --- Output to console ---
                if created:
                    self.stdout.write(self.style.SUCCESS(f"✅ ADDED: {product.title}"))
                    self.stdout.write(f"   💰 Price: ₹{price}")
                    self.stdout.write(f"   🔗 Affiliate: {affiliate_url}")
                    success_count += 1
                else:
                    old_price = product.current_price
                    self.stdout.write(self.style.SUCCESS(f"🔄 UPDATED: {product.title}"))
                    self.stdout.write(f"   💰 Price: ₹{old_price} → ₹{price}")
                    self.stdout.write(f"   🔗 Affiliate: {affiliate_url}")
                    success_count += 1

                # --- Check and trigger alerts ---
                alerts_sent = self._check_price_alerts(product, affiliate_url)
                alert_count += alerts_sent

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Database error: {str(e)}"))
                fail_count += 1
                continue

        # Summary
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("📊 SCRAPING SUMMARY"))
        self.stdout.write(self.style.SUCCESS(f"✅ Successful: {success_count}"))
        self.stdout.write(self.style.ERROR(f"❌ Failed: {fail_count}"))
        self.stdout.write(self.style.WARNING(f"📧 Alerts sent: {alert_count}"))
        self.stdout.write("="*60)

    def _handle_search(self, query, max_results):
        """Handle product search and return URLs"""
        from PriceTrack.tasks.scraper import scrape_amazon_search, scrape_flipkart_search
        
        urls = []
        
        # Search Amazon
        self.stdout.write(f"🛍️ Searching Amazon for: '{query}'")
        amazon_results = scrape_amazon_search(query, max_results)
        for product in amazon_results:
            urls.append(product['url'])
            self.stdout.write(f"   ✅ Found: {product['name']} - ₹{product['price']}")

        # Search Flipkart
        self.stdout.write(f"🛍️ Searching Flipkart for: '{query}'")
        flipkart_results = scrape_flipkart_search(query, max_results)
        for product in flipkart_results:
            urls.append(product['url'])
            self.stdout.write(f"   ✅ Found: {product['name']} - ₹{product['price']}")

        return urls

    def _check_price_alerts(self, product, affiliate_url):
        """Check and send price alerts for tracked products"""
        alerts = TrackedProduct.objects.filter(product=product, active=True)
        alert_count = 0
        
        for alert in alerts:
            if alert.threshold and product.current_price <= alert.threshold:
                try:
                    # Send email notification
                    send_price_alert(
                        alert.user.email,
                        product.title,
                        product.current_price,
                        affiliate_url,  # Use affiliate URL
                    )
                    
                    if alert.repeat_alerts:
                        self.stdout.write(
                            self.style.WARNING(f"   📩 REPEAT ALERT sent to: {alert.user.email}")
                        )
                    else:
                        # Deactivate one-time alert
                        alert.active = False
                        alert.save()
                        self.stdout.write(
                            self.style.WARNING(f"   📩 ONE-TIME ALERT sent to: {alert.user.email}")
                        )
                    
                    alert_count += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"   ❌ Failed to send alert: {str(e)}"))

        return alert_count
