from django.core.mail import send_mail
from django.conf import settings

def send_price_alert(user_email, product_title, current_price, product_url):
    subject = f"Price Drop Alert for {product_title}!"
    message = (
        f"Good news! 🎉\n\n"
        f"The product '{product_title}' has dropped in price.\n"
        f"Current Price: ₹{current_price}\n"
        f"Check it here: {product_url}\n\n"
        f"— Your Price Tracker Bot 🤖"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])
