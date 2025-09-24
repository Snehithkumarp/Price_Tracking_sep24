import re

def clean_flipkart_url(url: str) -> str:
    """Normalize Flipkart URL"""
    if "dl.flipkart.com" in url:
        return url
    match = re.search(r"/p/itm([a-zA-Z0-9]+)", url)
    if match:
        product_id = match.group(1)
        return f"https://www.flipkart.com/product/p/itm{product_id}"
    return url