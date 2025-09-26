# app/management/commands/send_test_email.py
from django.core.management.base import BaseCommand
from django.core.mail import send_mail

class Command(BaseCommand):
    help = "Send a test email"

    def handle(self, *args, **kwargs):
        send_mail(
            subject="🔔 Test Email from Django",
            message="If you see this, email is working!",
            from_email=None,  # uses DEFAULT_FROM_EMAIL
            recipient_list=["snehith.pottluru1212@gmail.com"],
            fail_silently=False,
        )
        self.stdout.write(self.style.SUCCESS("✅ Test email sent!"))


#----------------------------------------------------------------------------


# from django.core.mail import send_mail
# from django.conf import settings

# def send_notification(product, is_test=False):
#     """
#     Sends email notification.
#     If is_test=True, subject/body are marked as TEST.
#     """
#     if is_test or getattr(settings, "SCRAPER_TEST_MODE", False):
#         subject = f"🔔 TEST Notification: {product.name}"
#         message = f"""
#         Hello! This is a TEST notification.

#         Product: {product.name}
#         Current Price: {product.current_price}

#         ✅ If you see this, email is working correctly.
#         """
#     else:
#         subject = f"Price Alert: {product.name}"
#         message = f"""
#         The price for {product.name} has dropped!

#         Current Price: {product.current_price}
#         """

#     send_mail(
#         subject=subject,
#         message=message,
#         from_email=settings.DEFAULT_FROM_EMAIL,
#         recipient_list=["youraddress@example.com"],  # change to your test email
#         fail_silently=False,
#     )
