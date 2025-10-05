import re

# def clean_amazon_url(url: str) -> str:
#     """Normalize Amazon URL → https://www.amazon.in/dp/<ASIN>"""
#     match = re.search(r"/dp/([A-Z0-9]{10})", url)
#     if match:
#         asin = match.group(1)
#         return f"https://www.amazon.in/dp/{asin}"
#     return url

def clean_amazon_url(url: str) -> str:
    """
    Normalize Amazon product URL to standard format
    Handles multiple Amazon URL formats
    """
    try:
        # Remove ref parameters and other tracking parameters
        if '/dp/' in url:
            match = re.search(r'/dp/([A-Z0-9]{10})', url)
            if match:
                return f"https://www.amazon.in/dp/{match.group(1)}"
        
        # Handle /gp/product/ format
        elif '/gp/product/' in url:
            match = re.search(r'/gp/product/([A-Z0-9]{10})', url)
            if match:
                return f"https://www.amazon.in/dp/{match.group(1)}"
        
        # Handle shorter URL format
        elif 'amzn.in' in url or 'amazon.in/' in url:
            # Extract ASIN using regex
            asin_match = re.search(r'/([A-Z0-9]{10})(?:[/?]|$)', url)
            if asin_match:
                return f"https://www.amazon.in/dp/{asin_match.group(1)}"
        
        return url.split('?')[0]  # Remove query parameters
    
    except Exception as e:
        print(f"URL cleaning error: {e}")
        return url