# from django.core.mail import send_mail
# from django.conf import settings

# def send_price_alert(user_email, product_title, current_price, product_url):
#     subject = f"Price Drop Alert for {product_title}!"
#     message = (
#         f"Good news! 🎉\n\n"
#         f"The product '{product_title}' has dropped in price.\n"
#         f"Current Price: ₹{current_price}\n"
#         f"Check it here: {product_url}\n\n"
#         f"— Your Price Tracker Bot 🤖"
#     )
#     send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])
#----------------------------------------------------------------------------


from django.core.mail import send_mail
from django.conf import settings
import logging

# Set up logger
logger = logging.getLogger(__name__)

def send_price_alert(user_email, product_title, current_price, affiliate_url, threshold_price=None):
    """
    Send price drop alert email to user with affiliate link only.
    
    Args:
        user_email (str): Recipient's email address
        product_title (str): Name of the product
        current_price (float): Current price of the product
        affiliate_url (str): Affiliate link to the product
        threshold_price (float, optional): The price threshold that was set
    """
    try:
        # Validate that we have an affiliate URL
        if not affiliate_url:
            logger.error(f"No affiliate URL provided for {product_title}")
            return False
            
        # Email subject
        subject = f"🎉 Price Drop Alert for {product_title}!"
        
        # Email message template with affiliate link only
        message = f"""
Good news! The price has dropped on a product you're tracking.

📦 Product: {product_title}
💰 Current Price: ₹{current_price:,.2f}
{'🎯 Your Target Price: ₹' + str(threshold_price) if threshold_price else ''}
🛒 Buy Now: {affiliate_url}

Shop now and save! Using our link supports our service.

Happy shopping!

—
Your Price Tracker Bot 🤖
"""
        # Clean up message formatting
        message = '\n'.join(line.strip() for line in message.split('\n')).strip()

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
        logger.info(f"Price alert email sent successfully to {user_email} for {product_title}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send price alert email to {user_email}: {str(e)}")
        return False


def send_welcome_email(user_email, username):
    """
    Send welcome email to new users.
    """
    try:
        subject = "Welcome to Price Tracker! 🎉"
        message = f"""
Hi {username},

Welcome to Price Tracker! We're excited to help you save money.

With our service, you can:
• Track product prices automatically
• Get alerts when prices drop
• Never miss a great deal again
• Support us through affiliate links when you make purchases

Start adding products to track and save money on your favorite items!

Happy tracking! 🛍️

—
Price Tracker Team
"""
        message = '\n'.join(line.strip() for line in message.split('\n')).strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
        logger.info(f"Welcome email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
        return False


def send_price_increase_alert(user_email, product_title, current_price, old_price, affiliate_url):
    """
    Send notification when price increases significantly (affiliate link only).
    """
    try:
        if not affiliate_url:
            logger.error(f"No affiliate URL provided for price increase alert: {product_title}")
            return False
            
        subject = f"⚠️ Price Increase Notice for {product_title}"
        
        price_increase = current_price - old_price
        increase_percentage = (price_increase / old_price) * 100
        
        message = f"""
Heads up! The price has increased on a product you're tracking.

📦 Product: {product_title}
💰 Old Price: ₹{old_price:,.2f}
💰 Current Price: ₹{current_price:,.2f}
📈 Price Increase: ₹{price_increase:,.2f} ({increase_percentage:.1f}%)
🛒 Check Current Price: {affiliate_url}

The price might drop again soon. We'll keep tracking it for you!

—
Your Price Tracker Bot 🤖
"""
        message = '\n'.join(line.strip() for line in message.split('\n')).strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
        logger.info(f"Price increase alert sent to {user_email} for {product_title}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send price increase alert to {user_email}: {str(e)}")
        return False


def send_back_in_stock_alert(user_email, product_title, current_price, affiliate_url):
    """
    Send notification when a previously out-of-stock product is back in stock.
    """
    try:
        if not affiliate_url:
            logger.error(f"No affiliate URL provided for back in stock alert: {product_title}")
            return False
            
        subject = f"🔄 Back in Stock: {product_title}!"
        
        message = f"""
Great news! A product you were tracking is back in stock.

📦 Product: {product_title}
💰 Current Price: ₹{current_price:,.2f}
🛒 Buy Now: {affiliate_url}

Grab it before it sells out again!

—
Your Price Tracker Bot 🤖
"""
        message = '\n'.join(line.strip() for line in message.split('\n')).strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
        logger.info(f"Back in stock alert sent to {user_email} for {product_title}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send back in stock alert to {user_email}: {str(e)}")
        return False

