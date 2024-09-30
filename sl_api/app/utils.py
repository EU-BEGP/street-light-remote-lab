from django.conf import settings
from django.core.mail import EmailMultiAlternatives, BadHeaderError
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_custom_email(subject, template_name, context, recipient):
    email_body = render_to_string(template_name, context)
    email_body_plain = strip_tags(email_body)
    sender = settings.EMAIL_HOST_USER

    try:
        print(f"Sending email to {recipient}")
        msg = EmailMultiAlternatives(subject, email_body_plain, sender, recipient)
        msg.attach_alternative(email_body, "text/html")
        msg.send()
    except BadHeaderError:
        return HttpResponse("Invalid header found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
