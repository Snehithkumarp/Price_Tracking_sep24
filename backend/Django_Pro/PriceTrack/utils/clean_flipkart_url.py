import re

def clean_flipkart_url(url: str) -> str:
    """
    Normalize Flipkart URL to ensure consistent format
    """
    try:
        # Remove query parameters
        url = url.split('?')[0]
        
        # Handle different Flipkart URL formats
        if 'dl.flipkart.com' in url:
            return url
            
        # Extract product ID from various formats
        patterns = [
            r'/p/([a-zA-Z0-9]+)',
            r'/product/([a-zA-Z0-9]+)',
            r'/itm/([a-zA-Z0-9]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                product_id = match.group(1)
                return f"https://www.flipkart.com/product/p/{product_id}"
        
        return url
    except Exception as e:
        print(f"Flipkart URL cleaning error: {e}")
        return url