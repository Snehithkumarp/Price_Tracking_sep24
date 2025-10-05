# # =============================================
# # 🔹 Price Tracking Scraper (Amazon + Flipkart)
# # =============================================
# import re
# import time
# import requests
# from bs4 import BeautifulSoup
# from urllib.parse import quote

# from django.core.management.base import BaseCommand
# from PriceTrack.models import Product  # Adjust if your app name is different

# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options

# HEADERS = {
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
#     "Accept-Language": "en-US,en;q=0.9",
# }

# # ---------------------------
# # 🔎 SEARCH SCRAPERS
# # ---------------------------

# def scrape_amazon_search(query, max_results=5):
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
#                 "price": re.sub(r"[^\d.]", "", price_tag.get_text(strip=True).replace(",", "")),
#                 "image": image_tag["src"] if image_tag else "",
#                 "url": "https://www.amazon.in" + link_tag["href"]
#             })
#     return results


# def scrape_flipkart_search(query, max_results=5):
#     url = f"https://www.flipkart.com/search?q={quote(query)}"
#     res = requests.get(url, headers=HEADERS, timeout=15)
#     soup = BeautifulSoup(res.text, "html.parser")
#     results = []

#     products = soup.select("div._1AtVbE")[:max_results]
#     for item in products:
#         title_tag = item.select_one("div._4rR01T") or item.select_one("a.s1Q9rs")
#         price_tag = item.select_one("div._30jeq3")
#         image_tag = (
#             item.select_one("img._396cs4")
#             or item.select_one("img.utBuJY")
#             or item.select_one("img._53J4C-")
#             or item.select_one("img.DByuf4")
#             or item.select_one("img")
#         )
#         link_tag = item.select_one("a._1fQZEK") or item.select_one("a.s1Q9rs")

#         if title_tag and price_tag and link_tag:
#             img_url = ""
#             if image_tag:
#                 img_url = image_tag.get("src") or image_tag.get("data-src") or ""
#             results.append({
#                 "name": title_tag.get_text(strip=True),
#                 "price": price_tag.get_text(strip=True).replace("₹", "").replace(",", ""),
#                 "image": img_url,
#                 "url": "https://www.flipkart.com" + link_tag["href"]
#             })
#     return results


# # ---------------------------
# # 🛒 DIRECT PRODUCT SCRAPERS
# # ---------------------------

# def clean_amazon_url(url: str) -> str:
#     match = re.search(r"/dp/([A-Z0-9]{10})", url)
#     if match:
#         return f"https://www.amazon.in/dp/{match.group(1)}"
#     return url


# # def clean_flipkart_url(url: str) -> str:
# #     if "dl.flipkart.com" in url:
# #         return url.split("?")[0]
# #     if "/p/" in url:
# #         return url.split("?")[0]
# #     return url

# #update 24 sep
# def clean_flipkart_url(url: str) -> str:
#     if "dl.flipkart.com" in url or "/p/" in url:
#         return url.split("?")[0]
#     return url


# # def scrape_product(url: str) -> dict:
# #     if "amazon" in url:
# #         return scrape_amazon_product(url)
# #     elif "flipkart" in url:
# #         return scrape_flipkart_product(url)
# #     else:
# #         return {"name": None, "price": None, "image": None, "error": "Unsupported site"}
# def scrape_product(url: str) -> dict:
#     """
#     Scrape a product directly from a URL with better error handling
#     """
#     try:
#         if not url:
#             return {"error": "URL is required"}
            
#         if "amazon" in url:
#             result = scrape_amazon_product(url)
#         elif "flipkart" in url:
#             result = scrape_flipkart_product(url)
#         else:
#             return {"error": "Unsupported site"}
        
#         # Validate result
#         if not result.get("name") or not result.get("price"):
#             return {
#                 "error": "Failed to extract product data",
#                 "name": result.get("name"),
#                 "price": result.get("price"), 
#                 "image": result.get("image")
#             }
        
#         return result
        
#     except Exception as e:
#         print(f"❌ Scrape product error: {e}")
#         return {"error": f"Scraping failed: {str(e)}"}

# # ---------- AMAZON PRODUCT ----------
# # def scrape_amazon_product(url: str) -> dict:
# #     try:
# #         res = requests.get(url, headers=HEADERS, timeout=15)
# #         soup = BeautifulSoup(res.text, "html.parser")

# #         # Title fallbacks
# #         name = (
# #             soup.select_one("#productTitle")
# #             or soup.select_one("title")
# #             or soup.select_one("span.a-size-large")
# #             or soup.select_one("h1 span")
# #         )
# #         name = name.get_text(strip=True) if name else None

# #         price_el = soup.select_one("#priceblock_ourprice") or soup.select_one("#priceblock_dealprice") or soup.select_one(".a-price .a-offscreen")
# #         price = re.sub(r"[^\d.]", "", price_el.get_text(strip=True)) if price_el else None

# #         # Image
# #         img_el = soup.select_one("#landingImage, #imgTagWrapperId img")
# #         image = ""
# #         if img_el:
# #             image = img_el.get("data-old-hires") or img_el.get("src")
# #             # Optional: parse largest resolution from data-a-dynamic-image
# #             if not image and img_el.get("data-a-dynamic-image"):
# #                 import json
# #                 data = json.loads(img_el["data-a-dynamic-image"].replace("&quot;", '"'))
# #                 image = max(data.keys(), key=lambda k: data[k][0])

# #         return {"name": name, "price": price, "image": image}
# #     except Exception as e:
# #         print("❌ Amazon scraper error:", e)
# #         return {"name": None, "price": None, "image": None}

# def scrape_amazon_product(url: str) -> dict:
#     try:
#         # Clean the URL first
#         clean_url = clean_amazon_url(url)
        
#         # Enhanced headers to avoid bot detection
#         headers = {
#             **HEADERS,
#             "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
#             "Accept-Encoding": "gzip, deflate, br",
#             "DNT": "1",
#             "Connection": "keep-alive",
#             "Upgrade-Insecure-Requests": "1",
#         }
        
#         # Add delay to avoid rate limiting
#         time.sleep(1)
        
#         res = requests.get(clean_url, headers=headers, timeout=20)
        
#         # Check if request was successful
#         if res.status_code != 200:
#             print(f"❌ Amazon request failed with status: {res.status_code}")
#             return {"name": None, "price": None, "image": None, "error": f"Request failed: {res.status_code}"}
        
#         soup = BeautifulSoup(res.text, "html.parser")

#         # Enhanced title extraction with multiple fallbacks
#         name = None
#         title_selectors = [
#             "#productTitle",
#             "#title",
#             "h1.a-size-large",
#             "h1.a-size-medium",
#             "title"  # Fallback to page title
#         ]
        
#         for selector in title_selectors:
#             name_el = soup.select_one(selector)
#             if name_el:
#                 name = name_el.get_text(strip=True)
#                 if name and "amazon" not in name.lower():
#                     break

#         # Enhanced price extraction
#         price = None
#         price_selectors = [
#             ".a-price-whole",
#             ".a-price .a-offscreen",
#             "#priceblock_ourprice",
#             "#priceblock_dealprice",
#             "#priceblock_saleprice",
#             ".a-price-range .a-price .a-offscreen",
#             "#apex_desktop .a-price .a-offscreen"
#         ]
        
#         for selector in price_selectors:
#             price_el = soup.select_one(selector)
#             if price_el:
#                 price_text = price_el.get_text(strip=True)
#                 # Extract numbers and decimal point only
#                 price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
#                 if price_match:
#                     price = price_match.group()
#                     break

#         # Enhanced image extraction
#         image = ""
#         img_selectors = [
#             "#landingImage",
#             "#imgBlkFront",
#             ".a-dynamic-image",
#             "#main-image"
#         ]
        
#         for selector in img_selectors:
#             img_el = soup.select_one(selector)
#             if img_el:
#                 image = (img_el.get("data-old-hires") or 
#                         img_el.get("src") or 
#                         img_el.get("data-a-dynamic-image"))
#                 if image:
#                     # Handle JSON data-a-dynamic-image
#                     if image.startswith('{'):
#                         try:
#                             import json
#                             image_data = json.loads(image.replace("&quot;", '"'))
#                             if image_data:
#                                 image = list(image_data.keys())[0]
#                         except:
#                             pass
#                     break

#         return {
#             "name": name, 
#             "price": price, 
#             "image": image,
#             "url": clean_url
#         }
        
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Amazon network error: {e}")
#         return {"name": None, "price": None, "image": None, "error": f"Network error: {str(e)}"}
#     except Exception as e:
#         print(f"❌ Amazon scraper error: {e}")
#         return {"name": None, "price": None, "image": None, "error": f"Scraping error: {str(e)}"}


# # ---------- FLIPKART PRODUCT ----------
# def scrape_flipkart_product(url: str) -> dict:
#     try:
#         res = requests.get(url, headers=HEADERS, timeout=15)
#         soup = BeautifulSoup(res.text, "html.parser")

#         # Title fallbacks
#         name = (
#             soup.select_one("span.B_NuCI") or   # old selector
#             soup.select_one("span.VU-ZEz") or   # new selector (2024+)
#             soup.select_one("h1") or            # fallback to any h1
#             soup.select_one("title")            # fallback to <title>
#         )
#         name = name.get_text(strip=True) if name else None

#         # Price fallbacks
#         price_el = (
#             soup.select_one("div._30jeq3._16Jk6d") or 
#             soup.select_one("div.Nx9bqj.CxhGGd") or 
#             soup.select_one("div._25b18c ._30jeq3")  # fallback for offers
#         )
#         price = re.sub(r"[^\d]", "", price_el.get_text(strip=True)) if price_el else None

#         # Image fallback
#         img_el = (
#             soup.select_one("img._396cs4") or
#             soup.select_one("img.DByuf4") or
#             soup.select_one("img._53J4C-") or
#             soup.select_one("img")   # last fallback
#         )
#         image = img_el.get("src") if img_el else ""

#         return {"name": name, "price": price, "image": image}

#     except Exception as e:
#             print("❌ Flipkart scraper error:", e)
#             return {"name": None, "price": None, "image": None}
    

    
    

#     #     if name and price:
#     #         return {"name": name, "price": price, "image": image}

#     #     # Fallback: Selenium
#     #     print("⚠️ Flipkart requests failed, retrying with Selenium...")
#     #     return scrape_flipkart_selenium(url)

#     # except Exception as e:
#     #     print("❌ Flipkart scraper error:", e)
#     #     return {"name": None, "price": None, "image": None}


# def scrape_flipkart_selenium(url: str) -> dict:
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
#     time.sleep(3)

#     soup = BeautifulSoup(driver.page_source, "html.parser")
#     driver.quit()

#     # Title
#     name = soup.select_one("span.VU-ZEz") or soup.select_one("span.B_NuCI")
#     # Price
#     price = soup.select_one("div.Nx9bqj.CxhGGd") or soup.select_one("div._30jeq3._16Jk6d")
#     # Image
#     image_el = (
#         soup.select_one("img.DByuf4")
#         or soup.select_one("img._53J4C-")
#         or soup.select_one("img._396cs4")
#     )
#     image = image_el.get("src") if image_el else ""

#     return {
#         "name": name.get_text(strip=True) if name else None,
#         "price": price.get_text(strip=True) if price else None,
#         "image": image.get("src") if image else None
#     }



# ------------- 2nd code ------- *************** -----------------

# PriceTrack/tasks/scraper.py
# =============================================
# 🔹 Price Tracking Scraper (Amazon + Flipkart)
# =============================================
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}

# ---------------------------
# 🔎 SEARCH SCRAPERS
# ---------------------------

def scrape_amazon_search(query, max_results=5):
    """Search Amazon and return products with affiliate links"""
    url = f"https://www.amazon.in/s?k={quote(query)}"
    try:
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
                product_url = "https://www.amazon.in" + link_tag["href"]
                clean_url = clean_amazon_url(product_url)
                
                results.append({
                    "name": title_tag.get_text(strip=True),
                    "price": re.sub(r"[^\d.]", "", price_tag.get_text(strip=True).replace(",", "")),
                    "image": image_tag["src"] if image_tag else "",
                    "url": clean_url,
                    "site": "amazon"
                })
        return results
    except Exception as e:
        print(f"❌ Amazon search error: {e}")
        return []

def scrape_flipkart_search(query, max_results=5):
    """Search Flipkart and return products with affiliate links"""
    url = f"https://www.flipkart.com/search?q={quote(query)}"
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")
        results = []

        products = soup.select("div._1AtVbE")[:max_results]
        for item in products:
            title_tag = item.select_one("div._4rR01T") or item.select_one("a.s1Q9rs")
            price_tag = item.select_one("div._30jeq3")
            image_tag = (
                item.select_one("img._396cs4") or
                item.select_one("img.utBuJY") or
                item.select_one("img._53J4C-") or
                item.select_one("img.DByuf4") or
                item.select_one("img")
            )
            link_tag = item.select_one("a._1fQZEK") or item.select_one("a.s1Q9rs")

            if title_tag and price_tag and link_tag:
                product_url = "https://www.flipkart.com" + link_tag["href"]
                clean_url = clean_flipkart_url(product_url)
                
                img_url = ""
                if image_tag:
                    img_url = image_tag.get("src") or image_tag.get("data-src") or ""
                
                results.append({
                    "name": title_tag.get_text(strip=True),
                    "price": price_tag.get_text(strip=True).replace("₹", "").replace(",", ""),
                    "image": img_url,
                    "url": clean_url,
                    "site": "flipkart"
                })
        return results
    except Exception as e:
        print(f"❌ Flipkart search error: {e}")
        return []

# ---------------------------
# 🛒 DIRECT PRODUCT SCRAPERS
# ---------------------------

def clean_amazon_url(url: str) -> str:
    """Normalize Amazon product URL to standard /dp/ format"""
    if not url:
        return url
    
    # Handle Amazon short URLs
    if "amzn.to" in url:
        return url
    
    # Extract product ID from various Amazon URL formats
    patterns = [
        r"/dp/([A-Z0-9]{10})",
        r"/gp/product/([A-Z0-9]{10})",
        r"/product/([A-Z0-9]{10})",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return f"https://www.amazon.in/dp/{match.group(1)}"
    
    return url.split('?')[0]  # Remove query params if no product ID found

def clean_flipkart_url(url: str) -> str:
    """Normalize Flipkart URL"""
    if not url:
        return url
    
    # Handle Flipkart affiliate URLs
    if "dl.flipkart.com" in url:
        return url.split("?")[0]
    
    # Clean standard Flipkart URLs
    if "/p/" in url:
        return url.split("?")[0]
    
    return url

def scrape_product(url: str) -> dict:
    """
    Scrape a product directly from a URL with better error handling
    """
    try:
        if not url:
            return {"error": "URL is required"}
            
        # Clean URL first
        if "amazon" in url:
            clean_url = clean_amazon_url(url)
            result = scrape_amazon_product(clean_url)
        elif "flipkart" in url:
            clean_url = clean_flipkart_url(url)
            result = scrape_flipkart_product(clean_url)
        else:
            return {"error": "Unsupported site"}
        
        # Add original and clean URLs to result
        result["original_url"] = url
        result["clean_url"] = clean_url
        
        # Validate result
        if not result.get("name") or not result.get("price"):
            return {
                "error": "Failed to extract product data",
                "name": result.get("name"),
                "price": result.get("price"), 
                "image": result.get("image"),
                "clean_url": clean_url
            }
        
        return result
        
    except Exception as e:
        print(f"❌ Scrape product error: {e}")
        return {"error": f"Scraping failed: {str(e)}"}

# ---------- AMAZON PRODUCT ----------
def scrape_amazon_product(url: str) -> dict:
    """Scrape Amazon product with enhanced error handling"""
    try:
        # Add delay to avoid rate limiting
        time.sleep(1)
        
        res = requests.get(url, headers=HEADERS, timeout=20)
        if res.status_code != 200:
            return {"error": f"Request failed: {res.status_code}"}
        
        soup = BeautifulSoup(res.text, "html.parser")

        # Enhanced title extraction
        name = None
        title_selectors = [
            "#productTitle", "#title", "h1.a-size-large", 
            "h1.a-size-medium", "title"
        ]
        for selector in title_selectors:
            name_el = soup.select_one(selector)
            if name_el:
                name = name_el.get_text(strip=True)
                if name and "amazon" not in name.lower():
                    break

        # Enhanced price extraction
        price = None
        price_selectors = [
            ".a-price-whole", ".a-price .a-offscreen", "#priceblock_ourprice",
            "#priceblock_dealprice", "#priceblock_saleprice",
            ".a-price-range .a-price .a-offscreen"
        ]
        for selector in price_selectors:
            price_el = soup.select_one(selector)
            if price_el:
                price_text = price_el.get_text(strip=True)
                price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
                if price_match:
                    price = price_match.group()
                    break

        # Enhanced image extraction
        image = ""
        img_selectors = ["#landingImage", "#imgBlkFront", ".a-dynamic-image", "#main-image"]
        for selector in img_selectors:
            img_el = soup.select_one(selector)
            if img_el:
                image = img_el.get("data-old-hires") or img_el.get("src")
                if image:
                    # Handle JSON data-a-dynamic-image
                    if image.startswith('{'):
                        try:
                            import json
                            image_data = json.loads(image.replace("&quot;", '"'))
                            if image_data:
                                image = list(image_data.keys())[0]
                        except:
                            pass
                    break

        return {
            "name": name, 
            "price": price, 
            "image": image,
            "site": "amazon"
        }
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Amazon network error: {e}")
        return {"error": f"Network error: {str(e)}"}
    except Exception as e:
        print(f"❌ Amazon scraper error: {e}")
        return {"error": f"Scraping error: {str(e)}"}

# ---------- FLIPKART PRODUCT ----------
def scrape_flipkart_product(url: str) -> dict:
    """Scrape Flipkart product with enhanced error handling"""
    try:
        # Add delay to avoid rate limiting
        time.sleep(1)
        
        res = requests.get(url, headers=HEADERS, timeout=15)
        if res.status_code != 200:
            # Fallback to Selenium for dynamic content
            print("⚠️ Flipkart requests failed, retrying with Selenium...")
            return scrape_flipkart_selenium(url)
        
        soup = BeautifulSoup(res.text, "html.parser")

        # Title with fallbacks
        name = (
            soup.select_one("span.B_NuCI") or 
            soup.select_one("span.VU-ZEz") or 
            soup.select_one("h1") or 
            soup.select_one("title")
        )
        name = name.get_text(strip=True) if name else None

        # Price with fallbacks
        price_el = (
            soup.select_one("div._30jeq3._16Jk6d") or 
            soup.select_one("div.Nx9bqj.CxhGGd") or 
            soup.select_one("div._25b18c ._30jeq3")
        )
        price = re.sub(r"[^\d.]", "", price_el.get_text(strip=True)) if price_el else None

        # Image with fallbacks
        img_el = (
            soup.select_one("img._396cs4") or
            soup.select_one("img.DByuf4") or
            soup.select_one("img._53J4C-") or
            soup.select_one("img")
        )
        image = img_el.get("src") if img_el else ""

        # If basic scraping failed, try Selenium
        if not name or not price:
            print("⚠️ Flipkart basic scraping failed, retrying with Selenium...")
            return scrape_flipkart_selenium(url)

        return {
            "name": name, 
            "price": price, 
            "image": image,
            "site": "flipkart"
        }

    except Exception as e:
        print(f"❌ Flipkart scraper error: {e}")
        # Final fallback to Selenium
        try:
            return scrape_flipkart_selenium(url)
        except Exception as selenium_error:
            return {"error": f"Flipkart scraping failed: {str(selenium_error)}"}

def scrape_flipkart_selenium(url: str) -> dict:
    """Selenium fallback for Flipkart dynamic content"""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(f"user-agent={HEADERS['User-Agent']}")

    driver = None
    try:
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        time.sleep(3)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        name = soup.select_one("span.VU-ZEz") or soup.select_one("span.B_NuCI")
        price = soup.select_one("div.Nx9bqj.CxhGGd") or soup.select_one("div._30jeq3._16Jk6d")
        image_el = soup.select_one("img.DByuf4") or soup.select_one("img._53J4C-") or soup.select_one("img._396cs4")

        return {
            "name": name.get_text(strip=True) if name else None,
            "price": price.get_text(strip=True) if price else None,
            "image": image_el.get("src") if image_el else None,
            "site": "flipkart"
        }
    except Exception as e:
        print(f"❌ Flipkart Selenium error: {e}")
        return {"error": f"Selenium scraping failed: {str(e)}"}
    finally:
        if driver:
            driver.quit()





