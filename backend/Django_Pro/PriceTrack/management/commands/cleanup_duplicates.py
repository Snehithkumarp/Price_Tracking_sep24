# management/commands/cleanup_duplicates.py
from django.core.management.base import BaseCommand
from django.db import transaction
from PriceTrack.models import Product, PriceHistory, TrackedProduct
from PriceTrack.tasks.scraper import clean_amazon_url, clean_flipkart_url
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Remove duplicate products and consolidate data"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write("🔍 Finding duplicate products...")
        
        # Group products by normalized URL
        url_groups = defaultdict(list)
        
        for product in Product.objects.all():
            normalized_url = self.normalize_url(product.product_url)
            url_groups[normalized_url].append(product)
        
        duplicates_found = 0
        products_kept = 0
        products_deleted = 0
        
        for normalized_url, products in url_groups.items():
            if len(products) > 1:
                duplicates_found += 1
                self.stdout.write(f"\n📦 Found {len(products)} duplicates for:")
                self.stdout.write(f"   URL: {normalized_url}")
                
                # Decide which product to keep (the one with most price history)
                keeper = self.choose_keeper_product(products)
                
                self.stdout.write(f"   ✅ Keeping: {keeper.title} (ID: {keeper.id})")
                products_kept += 1
                
                duplicates = [p for p in products if p.id != keeper.id]
                
                if not dry_run:
                    # Migrate data and delete duplicates
                    deleted_count = self.migrate_and_delete_duplicates(keeper, duplicates)
                    products_deleted += deleted_count
                else:
                    products_deleted += len(duplicates)
                    for dup in duplicates:
                        self.stdout.write(f"   🗑️ Would delete: {dup.title} (ID: {dup.id})")
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"\n🔍 DRY RUN: Found {duplicates_found} duplicate groups, "
                    f"would keep {products_kept} and delete {products_deleted} products"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ Cleanup complete! "
                    f"Processed {duplicates_found} duplicate groups, "
                    f"kept {products_kept} and deleted {products_deleted} products"
                )
            )

    def normalize_url(self, url):
        """Normalize URL for grouping"""
        if not url:
            return "empty_url"
        
        try:
            if "amazon" in url:
                return clean_amazon_url(url)
            elif "flipkart" in url:
                return clean_flipkart_url(url)
            return url
        except Exception as e:
            logger.error(f"URL normalization error: {e}")
            return url

    def choose_keeper_product(self, products):
        """Choose which product to keep based on data richness"""
        # Prefer product with most price history
        products_with_history = []
        for product in products:
            history_count = PriceHistory.objects.filter(product=product).count()
            tracked_count = TrackedProduct.objects.filter(product=product).count()
            products_with_history.append((product, history_count, tracked_count))
        
        # Sort by: most price history -> most tracked -> oldest
        products_with_history.sort(key=lambda x: (-x[1], -x[2], x[0].id))
        return products_with_history[0][0]

    @transaction.atomic
    def migrate_and_delete_duplicates(self, keeper, duplicates):
        """Migrate all data from duplicates to keeper and delete duplicates"""
        deleted_count = 0
        
        for duplicate in duplicates:
            try:
                # Migrate PriceHistory
                PriceHistory.objects.filter(product=duplicate).update(product=keeper)
                
                # Migrate TrackedProduct
                TrackedProduct.objects.filter(product=duplicate).update(product=keeper)
                
                # Delete the duplicate
                duplicate.delete()
                deleted_count += 1
                
                self.stdout.write(f"   ✅ Migrated data and deleted duplicate ID: {duplicate.id}")
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"   ❌ Failed to migrate duplicate ID {duplicate.id}: {e}")
                )
        
        return deleted_count