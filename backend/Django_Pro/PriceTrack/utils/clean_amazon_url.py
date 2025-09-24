import re

def clean_amazon_url(url: str) -> str:
    """Normalize Amazon URL → https://www.amazon.in/dp/<ASIN>"""
    match = re.search(r"/dp/([A-Z0-9]{10})", url)
    if match:
        asin = match.group(1)
        return f"https://www.amazon.in/dp/{asin}"
    return url