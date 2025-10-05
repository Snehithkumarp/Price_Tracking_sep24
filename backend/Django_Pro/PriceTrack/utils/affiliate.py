# PriceTrack/utils/affiliate.py
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import re

def make_amazon_affiliate(url: str, tag: str = "bestdealsa-21") -> str:
    """
    Convert normal Amazon product URL into an affiliate URL with your tag.
    Preserves existing affiliate links - does NOT override them.
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    
    # Handle short Amazon URLs (amzn.to) - these are already affiliate links
    if "amzn.to" in url:
        return url
    
    # If already has OUR affiliate tag, return as-is (avoid duplicates)
    if f"tag={tag}" in url:
        return url
    
    # If already has SOME affiliate tag, return as-is (don't override)
    if "tag=" in url:
        return url
    
    try:
        parsed = urlparse(url)
    except Exception:
        return None
    
    # Ensure it's an Amazon URL
    if not any(domain in parsed.netloc for domain in ['amazon.', 'amzn.']):
        return None
    
    # Parse query parameters
    query_params = parse_qs(parsed.query)
    
    # Extract product ID for cleaner URLs
    product_id = None
    path_parts = parsed.path.split('/')
    
    # Handle different Amazon URL formats
    if '/dp/' in url:
        # Standard product URL: /dp/B08N5WRWNW
        try:
            dp_parts = url.split('/dp/')
            if len(dp_parts) > 1:
                product_id = dp_parts[1].split('/')[0].split('?')[0]
                base_url = f"https://{parsed.netloc}/dp/{product_id}"
            else:
                base_url = url.split('?')[0]
        except:
            base_url = url.split('?')[0]
            
    elif '/gp/' in url:
        base_url = url.split('?')[0]
    else:
        base_url = url.split('?')[0]
    
    # Add our affiliate tag
    if '?' in base_url:
        # Check if it already ends with ? or &
        if base_url.endswith('?') or base_url.endswith('&'):
            affiliate_url = f"{base_url}tag={tag}"
        else:
            affiliate_url = f"{base_url}&tag={tag}"
    else:
        affiliate_url = f"{base_url}?tag={tag}"
    
    return affiliate_url


def make_flipkart_affiliate(url: str, affiliate_id: str = "bestdealsa") -> str:
    """
    Convert normal Flipkart product URL into an affiliate URL.
    FIXED: Now properly adds affiliate tags and handles duplicates.
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    
    # Handle existing affiliate links (dl.flipkart.com) - return as-is
    if "dl.flipkart.com" in url:
        return url
    
    # If already has OUR affiliate ID, return as-is (avoid duplicates)
    if f"affid={affiliate_id}" in url:
        return url
    
    # If already has SOME affiliate ID, return as-is (don't override)
    if "affid=" in url:
        return url
    
    try:
        parsed = urlparse(url)
    except Exception:
        return None
    
    # Ensure it's a Flipkart URL
    if "flipkart.com" not in parsed.netloc:
        return None
    
    # Parse query parameters
    query_params = parse_qs(parsed.query)
    
    # Extract product ID from different Flipkart URL formats
    product_id = None
    path_parts = parsed.path.split('/')
    
    # Format 1: /p/itm?pid=XYZ
    if 'p' in path_parts and 'itm' in path_parts:
        if 'pid' in query_params:
            product_id = query_params['pid'][0]
            # Build clean affiliate URL
            affiliate_url = f"https://{parsed.netloc}/p/itm?pid={product_id}&affid={affiliate_id}"
            return affiliate_url
    
    # Format 2: /product-name/p/itmXYZ
    elif len(path_parts) >= 4 and path_parts[-2] == 'p':
        last_part = path_parts[-1]
        if last_part.startswith('itm'):
            product_id = last_part
    
    # Format 3: Look for product ID in the path
    for part in path_parts:
        if part.startswith('itm') and len(part) > 3:
            product_id = part
            break
    
    # If we found a product ID, build clean URL
    if product_id:
        # Clean the product ID (remove 'itm' prefix if present)
        clean_pid = product_id[3:] if product_id.startswith('itm') else product_id
        affiliate_url = f"https://{parsed.netloc}/p/itm?pid={clean_pid}&affid={affiliate_id}"
        return affiliate_url
    
    # FALLBACK: Add affiliate parameter to original URL (IMPROVED)
    # First, clean any existing affiliate parameters to avoid duplicates
    clean_url = re.sub(r'[?&]affid=[^&]+', '', url)
    clean_url = re.sub(r'\?&', '?', clean_url)
    clean_url = re.sub(r'[?&]$', '', clean_url)
    
    if '?' in clean_url:
        affiliate_url = f"{clean_url}&affid={affiliate_id}"
    else:
        affiliate_url = f"{clean_url}?affid={affiliate_id}"
    
    return affiliate_url


def make_affiliate_link(url: str, platform: str = "auto") -> str:
    """
    Main function to convert normal product URLs into affiliate URLs.
    FIXED: Handles duplicates and ensures proper affiliate tag addition.
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    
    # Auto-detect platform
    if platform == "auto":
        url_lower = url.lower()
        if "amazon" in url_lower or "amzn.to" in url_lower:
            platform = "amazon"
        elif "flipkart" in url_lower:
            platform = "flipkart"
        else:
            return url  # Return as-is for unsupported platforms
    
    # Route to appropriate function
    if platform == "amazon":
        tag = "bestdealsa-21"  # Your Amazon affiliate tag
        return make_amazon_affiliate(url, tag)
    
    elif platform == "flipkart":
        affiliate_id = "bestdealsa"  # Your Flipkart affiliate ID
        return make_flipkart_affiliate(url, affiliate_id)
    
    else:
        return url  # Unsupported platform


def process_product_links(products_data):
    """
    Process a list of product data and add affiliate links without duplicates.
    
    Args:
        products_data: List of dictionaries with product data including 'url'
    
    Returns:
        List of processed products with affiliate links
    """
    if not products_data:
        return []
    
    processed_products = []
    seen_urls = set()
    
    for product in products_data:
        if not product.get('url'):
            continue
            
        original_url = product['url'].strip()
        
        # Skip if we've already processed this URL (avoid duplicates)
        if original_url in seen_urls:
            continue
            
        seen_urls.add(original_url)
        
        # Create affiliate link
        affiliate_url = make_affiliate_link(original_url)
        
        # Add affiliate URL to product data
        product['affiliate_url'] = affiliate_url or original_url
        processed_products.append(product)
    
    return processed_products


# Override versions (Use with caution - may violate affiliate program terms)
def make_amazon_affiliate_override(url: str, tag: str = "bestdealsa-21") -> str:
    """
    ALWAYS convert to your Amazon affiliate tag, even if already has one.
    USE WITH CAUTION - may violate affiliate program terms.
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    
    # Remove any existing affiliate parameters
    url = re.sub(r'[?&]tag=[^&]+', '', url)
    # Clean up double ? or trailing &
    url = re.sub(r'\?&', '?', url)
    url = re.sub(r'[?&]$', '', url)
    
    try:
        parsed = urlparse(url)
    except Exception:
        return None
    
    # Ensure it's an Amazon URL
    if not any(domain in parsed.netloc for domain in ['amazon.', 'amzn.']):
        return None
    
    # Extract product ID for cleaner URLs
    path_parts = parsed.path.split('/')
    
    if '/dp/' in url:
        # Standard product URL: /dp/B08N5WRWNW
        try:
            dp_parts = url.split('/dp/')
            if len(dp_parts) > 1:
                product_id = dp_parts[1].split('/')[0].split('?')[0]
                base_url = f"https://{parsed.netloc}/dp/{product_id}"
            else:
                base_url = url.split('?')[0]
        except:
            base_url = url.split('?')[0]
    elif '/gp/' in url:
        base_url = url.split('?')[0]
    else:
        base_url = url.split('?')[0]
    
    # Add our affiliate tag
    if '?' in base_url:
        affiliate_url = f"{base_url}&tag={tag}"
    else:
        affiliate_url = f"{base_url}?tag={tag}"
    
    return affiliate_url


def make_flipkart_affiliate_override(url: str, affiliate_id: str = "bestdealsa") -> str:
    """
    ALWAYS convert to your Flipkart affiliate ID, even if already has one.
    USE WITH CAUTION - may violate affiliate program terms.
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    
    # Remove any existing affiliate parameters
    url = re.sub(r'[?&]affid=[^&]+', '', url)
    # Clean up double ? or trailing &
    url = re.sub(r'\?&', '?', url)
    url = re.sub(r'[?&]$', '', url)
    
    try:
        parsed = urlparse(url)
    except Exception:
        return None
    
    # Ensure it's a Flipkart URL
    if "flipkart.com" not in parsed.netloc:
        return None
    
    # Parse query parameters
    query_params = parse_qs(parsed.query)
    
    # Extract product ID
    product_id = None
    path_parts = parsed.path.split('/')
    
    # Format 1: /p/itm?pid=XYZ
    if 'p' in path_parts and 'itm' in path_parts:
        if 'pid' in query_params:
            product_id = query_params['pid'][0]
            affiliate_url = f"https://{parsed.netloc}/p/itm?pid={product_id}&affid={affiliate_id}"
            return affiliate_url
    
    # Format 2: /product-name/p/itmXYZ
    elif len(path_parts) >= 4 and path_parts[-2] == 'p' and path_parts[-1].startswith('itm'):
        product_id = path_parts[-1]
        if product_id.startswith('itm'):
            product_id = product_id[3:]
    
    # If we have a product ID, build clean URL
    if product_id:
        affiliate_url = f"https://{parsed.netloc}/p/itm?pid={product_id}&affid={affiliate_id}"
        return affiliate_url
    
    # Fallback: Add affiliate parameter
    if '?' in url:
        affiliate_url = f"{url}&affid={affiliate_id}"
    else:
        affiliate_url = f"{url}?affid={affiliate_id}"
    
    return affiliate_url


# Test functions
def test_affiliate_system():
    """Test the affiliate link generation system"""
    print("Testing Affiliate System")
    print("=" * 60)
    
    test_cases = [
        # Amazon URLs
        {
            "url": "https://www.amazon.in/dp/B0C5B1XW1W",
            "expected": "amazon",
            "description": "Clean Amazon product URL"
        },
        {
            "url": "https://www.amazon.in/dp/B0C5B1XW1W?ref=abc123",
            "expected": "amazon", 
            "description": "Amazon URL with existing params"
        },
        {
            "url": "https://www.amazon.in/dp/B0C5B1XW1W?tag=someone-20",
            "expected": "amazon",
            "description": "Amazon URL with existing affiliate tag"
        },
        {
            "url": "https://amzn.to/3abc123",
            "expected": "amazon",
            "description": "Amazon short URL"
        },
        # Flipkart URLs
        {
            "url": "https://www.flipkart.com/samsung-galaxy-m04-blue-64-gb/p/itm123456789",
            "expected": "flipkart",
            "description": "Flipkart product URL"
        },
        {
            "url": "https://www.flipkart.com/p/itm?pid=ABCDEFGHIJKLM",
            "expected": "flipkart",
            "description": "Flipkart PID URL"
        },
        {
            "url": "https://dl.flipkart.com/dl/already-affiliate-link",
            "expected": "flipkart",
            "description": "Flipkart affiliate URL"
        },
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test['description']}")
        print(f"Input:  {test['url']}")
        
        result = make_affiliate_link(test['url'])
        print(f"Output: {result}")
        
        # Check if affiliate link was added
        if test['expected'] == 'amazon':
            success = 'tag=bestdealsa-21' in result if result else False
        else:  # flipkart
            success = 'affid=bestdealsa' in result if result else False
            
        status = "✓ AFFILIATE ADDED" if success and result != test['url'] else "✓ PRESERVED (had existing tag)" if result == test['url'] else "✗ FAILED"
        print(f"Status: {status}")


if __name__ == "__main__":
    test_affiliate_system()