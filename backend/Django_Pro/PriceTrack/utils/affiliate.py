# utils/affiliate.py
def make_amazon_affiliate(url: str, tag: str = "bestdealsa-21") -> str:
    """
    Convert normal Amazon product URL into an affiliate URL with your tag.
    """
    if not url:
        return None

    if "amzn.to" in url:  # short Amazon URL (already okay)
        return url

    if "tag=" in url:  # already has affiliate tag
        return url

    # Clean URL (only keep product part)
    if "/dp/" in url:
        base = url.split("/dp/")[0] + "/dp/" + url.split("/dp/")[1].split("/")[0]
    elif "/gp/" in url:
        base = url.split("?")[0]
    else:
        base = url.split("?")[0]

    return f"{base}?tag={tag}"
