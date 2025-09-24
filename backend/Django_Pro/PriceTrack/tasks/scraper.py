# # =============================================
# # 🔹 Price Tracking Scraper
# # =============================================
# # Supports:
# # 1. Amazon & Flipkart search (keyword)
# # 2. Direct product scraping by URL
# # 3. Flipkart Selenium fallback for dynamic content
# # =============================================

# import requests
# from bs4 import BeautifulSoup
# from urllib.parse import quote
# import re
# import time

# # Selenium for Flipkart dynamic pages
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options

# # ---------------------------
# # 🌐 Request Headers
# # ---------------------------
# HEADERS = {
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
#     "Accept-Language": "en-US,en;q=0.9",
# }

# # ---------------------------
# # 🔎 SEARCH SCRAPERS
# # ---------------------------

# def scrape_amazon_search(query, max_results=5):
#     """
#     Search Amazon India for a query and return a list of products.
#     """
#     url = f"https://www.amazon.in/s?k={quote(query)}"
#     res = requests.get(url, headers=HEADERS, timeout=15)
#     soup = BeautifulSoup(res.text, "html.parser")
#     results = []

#     products = soup.select(".s-main-slot .s-result-item")[:max_results]
#     for item in products:
#         title_tag = item.select_one("h2 a span")
#         price_tag = item.select_one(".a-price .a-price-whole")
#         image_tag = item.select_one(".s-image")
#         link_tag = item.select_one("h2 a")

#         if title_tag and price_tag and link_tag:
#             results.append({
#                 "name": title_tag.get_text(strip=True),
#                 "price": price_tag.get_text(strip=True).replace(",", ""),
#                 "image": image_tag["src"] if image_tag else "",
#                 "url": "https://www.amazon.in" + link_tag["href"]
#             })
#     return results


# def scrape_flipkart_search(query, max_results=5):
#     """
#     Search Flipkart for a query and return a list of products.
#     """
#     url = f"https://www.flipkart.com/search?q={quote(query)}"
#     res = requests.get(url, headers=HEADERS, timeout=15)
#     soup = BeautifulSoup(res.text, "html.parser")
#     results = []

#     products = soup.select("div._1AtVbE")[:max_results]
#     for item in products:
#         title_tag = item.select_one("div._4rR01T") or item.select_one("a.s1Q9rs")
#         price_tag = item.select_one("div._30jeq3")
#         image_tag = item.select_one("img._396cs4") or item.select_one("img")  or item.select_one("img._53J4C") or item.select_one("img._53J4C")
# #         image_tag = (
# #     item.select_one("img._396cs4")
# #     or item.select_one("img._53J4C-")
# #     or item.select_one("img.utBuJY")
# #     or item.select_one("img.s-image")   # for Amazon fallback
# #     or item.select_one("img")           # final fallback
# # )
#         link_tag = item.select_one("a._1fQZEK") or item.select_one("a.s1Q9rs")

#         if title_tag and price_tag and link_tag:
#             results.append({
#                 "name": title_tag.get_text(strip=True),
#                 "price": price_tag.get_text(strip=True).replace("₹", "").replace(",", ""),
#                 "image": image_tag["src"] if image_tag else "",
#                 "url": "https://www.flipkart.com" + link_tag["href"]
#             })
#     return results


# # ---------------------------
# # 🛒 DIRECT PRODUCT SCRAPERS
# # ---------------------------

# def clean_amazon_url(url: str) -> str:
#     """
#     Normalize Amazon product URL to standard /dp/ format
#     """
#     match = re.search(r"/dp/([A-Z0-9]{10})", url)
#     if match:
#         return f"https://www.amazon.in/dp/{match.group(1)}"
#     return url


# def clean_flipkart_url(url: str) -> str:
#     """
#     Normalize Flipkart URL, removing query params
#     """
#     if "dl.flipkart.com" in url:
#         return url.split("?")[0]
#     if "/p/" in url:
#         return url.split("?")[0]
#     return url


# def scrape_product(url: str) -> dict:
#     """
#     Scrape a product directly from a URL
#     Determines site and calls the correct scraper
#     """
#     if "amazon" in url:
#         return scrape_amazon_product(url)
#     elif "flipkart" in url:
#         return scrape_flipkart_product(url)
#     else:
#         return {"error": "Unsupported site"}


# # ---------- AMAZON PRODUCT ----------
# def scrape_amazon_product(url: str) -> dict:
#     """
#     Scrape Amazon product page for name, price, image
#     """
#     try:
#         res = requests.get(url, headers=HEADERS, timeout=15)
#         soup = BeautifulSoup(res.text, "html.parser")

#         name = soup.select_one("#productTitle")
#         name = name.get_text(strip=True) if name else None

#         price = None
#         for selector in ["#priceblock_ourprice", "#priceblock_dealprice", ".a-price .a-offscreen"]:
#             el = soup.select_one(selector)
#             if el:
#                 price = el.get_text(strip=True)
#                 break

#         image = None
#         img_el = soup.select_one("#landingImage, #imgTagWrapperId img")
#         if img_el:
#             image = img_el.get("src")

#         return {"name": name, "price": price, "image": image}

#     except Exception as e:
#         print("❌ Amazon scraper error:", e)
#         return {}


# # ---------- FLIPKART PRODUCT ----------
# def scrape_flipkart_product(url: str) -> dict:
#     """
#     Scrape Flipkart product page using requests
#     Fallback to Selenium if requests fail
#     """
#     try:
#         res = requests.get(url, headers=HEADERS, timeout=15)
#         soup = BeautifulSoup(res.text, "html.parser")

#         name = soup.select_one("span.B_NuCI")
#         name = name.get_text(strip=True) if name else None

#         price_el = soup.select_one("div._30jeq3._16Jk6d")
#         price = price_el.get_text(strip=True) if price_el else None

#         img_el = soup.select_one("img._396cs4._2amPTt._3qGmMb")
#         image = img_el.get("src") if img_el else None

#         if name and price:
#             return {"name": name, "price": price, "image": image}

#         # Fallback to Selenium for dynamic pages
#         print("⚠️ Flipkart requests failed, retrying with Selenium...")
#         return scrape_flipkart_selenium(url)

#     except Exception as e:
#         print("❌ Flipkart scraper error:", e)
#         return {}


# def scrape_flipkart_selenium(url: str) -> dict:
#     """
#     Use Selenium to scrape Flipkart product pages with dynamic content
#     """
#     options = Options()
#     options.add_argument("--headless")
#     options.add_argument("--disable-gpu")
#     options.add_argument("--no-sandbox")
#     options.add_argument("--window-size=1920,1080")
#     options.add_argument(
#         "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#         "AppleWebKit/537.36 (KHTML, like Gecko) "
#         "Chrome/124.0.0.0 Safari/537.36"
#     )

#     driver = webdriver.Chrome(options=options)
#     driver.get(url)
#     time.sleep(3)  # allow page to fully load

#     soup = BeautifulSoup(driver.page_source, "html.parser")
#     driver.quit()

#     name = soup.select_one("span.VU-ZEz") or soup.select_one("span.B_NuCI")
#     price = soup.select_one("div.Nx9bqj.CxhGGd") or soup.select_one("div._30jeq3._16Jk6d")
#     image = soup.select_one("img.DByuf4") or soup.select_one("img._396cs4")

#     return {
#         "name": name.get_text(strip=True) if name else None,
#         "price": price.get_text(strip=True) if price else None,
#         "image": image["src"] if image else None
#     }
# =============================================
# 🔹 Price Tracking Scraper (Amazon + Flipkart)
# =============================================

import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-US,en;q=0.9",
}

# ---------------------------
# 🔎 SEARCH SCRAPERS
# ---------------------------

def scrape_amazon_search(query, max_results=5):
    url = f"https://www.amazon.in/s?k={quote(query)}"
    res = requests.get(url, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(res.text, "html.parser")
    results = []

    products = soup.select(".s-main-slot .s-result-item")[:max_results]
    for item in products:
        title_tag = item.select_one("h2 a span")
        price_tag = item.select_one(".a-price .a-price-whole")
        image_tag = item.select_one(".s-image")
        link_tag = item.select_one("h2 a")

        if title_tag and price_tag and link_tag:
            results.append({
                "name": title_tag.get_text(strip=True),
                "price": price_tag.get_text(strip=True).replace(",", ""),
                "image": image_tag["src"] if image_tag else "",
                "url": "https://www.amazon.in" + link_tag["href"]
            })
    return results


def scrape_flipkart_search(query, max_results=5):
    url = f"https://www.flipkart.com/search?q={quote(query)}"
    res = requests.get(url, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(res.text, "html.parser")
    results = []

    products = soup.select("div._1AtVbE")[:max_results]
    for item in products:
        title_tag = item.select_one("div._4rR01T") or item.select_one("a.s1Q9rs")
        price_tag = item.select_one("div._30jeq3")
        image_tag = (
            item.select_one("img._396cs4")
            or item.select_one("img.utBuJY")
            or item.select_one("img._53J4C-")
            or item.select_one("img.DByuf4")
            or item.select_one("img")
        )
        link_tag = item.select_one("a._1fQZEK") or item.select_one("a.s1Q9rs")

        if title_tag and price_tag and link_tag:
            img_url = ""
            if image_tag:
                img_url = image_tag.get("src") or image_tag.get("data-src") or ""
            results.append({
                "name": title_tag.get_text(strip=True),
                "price": price_tag.get_text(strip=True).replace("₹", "").replace(",", ""),
                "image": img_url,
                "url": "https://www.flipkart.com" + link_tag["href"]
            })
    return results


# ---------------------------
# 🛒 DIRECT PRODUCT SCRAPERS
# ---------------------------

def clean_amazon_url(url: str) -> str:
    match = re.search(r"/dp/([A-Z0-9]{10})", url)
    if match:
        return f"https://www.amazon.in/dp/{match.group(1)}"
    return url


def clean_flipkart_url(url: str) -> str:
    if "dl.flipkart.com" in url:
        return url.split("?")[0]
    if "/p/" in url:
        return url.split("?")[0]
    return url


def scrape_product(url: str) -> dict:
    if "amazon" in url:
        return scrape_amazon_product(url)
    elif "flipkart" in url:
        return scrape_flipkart_product(url)
    else:
        return {"error": "Unsupported site"}


# ---------- AMAZON PRODUCT ----------
def scrape_amazon_product(url: str) -> dict:
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")

        name = soup.select_one("#productTitle")
        name = name.get_text(strip=True) if name else None

        price = None
        for selector in ["#priceblock_ourprice", "#priceblock_dealprice", ".a-price .a-offscreen"]:
            el = soup.select_one(selector)
            if el:
                price = el.get_text(strip=True)
                break

        image = None
        img_el = soup.select_one("#landingImage, #imgTagWrapperId img")
        if img_el:
            image = img_el.get("src")

        return {"name": name, "price": price, "image": image}

    except Exception as e:
        print("❌ Amazon scraper error:", e)
        return {}


# ---------- FLIPKART PRODUCT ----------
def scrape_flipkart_product(url: str) -> dict:
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")

        name = soup.select_one("span.B_NuCI") or soup.select_one("span.VU-ZEz")
        name = name.get_text(strip=True) if name else None

        price_el = soup.select_one("div._30jeq3._16Jk6d") or soup.select_one("div.Nx9bqj.CxhGGd")
        price = price_el.get_text(strip=True) if price_el else None

        img_el = (
            soup.select_one("img._396cs4._2amPTt._3qGmMb")
            or soup.select_one("img.DByuf4")
            or soup.select_one("img._53J4C-")
            or soup.select_one("img.utBuJY")
            or soup.select_one("img")
        )
        image = None
        if img_el:
            image = img_el.get("src") or img_el.get("data-src") or ""

        if name and price:
            return {"name": name, "price": price, "image": image}

        print("⚠️ Flipkart requests failed, retrying with Selenium...")
        return scrape_flipkart_selenium(url)

    except Exception as e:
        print("❌ Flipkart scraper error:", e)
        return {}


def scrape_flipkart_selenium(url: str) -> dict:
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(options=options)
    driver.get(url)
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    name = soup.select_one("span.VU-ZEz") or soup.select_one("span.B_NuCI")
    price = soup.select_one("div.Nx9bqj.CxhGGd") or soup.select_one("div._30jeq3._16Jk6d")
    image = (
        soup.select_one("img.DByuf4")
        or soup.select_one("img._53J4C-")
        or soup.select_one("img._396cs4")
    )

    return {
        "name": name.get_text(strip=True) if name else None,
        "price": price.get_text(strip=True) if price else None,
        "image": image.get("src") if image else None
    }
