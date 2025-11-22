import base64
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import asyncio
from config import settings


async def _get_access_token() -> str:
    token_url = 'https://oauth2.googleapis.com/token'
    payload = {
        'client_id': settings.GMAIL_CLIENT_ID,
        'client_secret': settings.GMAIL_CLIENT_SECRET,
        'refresh_token': settings.GMAIL_REFRESH_TOKEN,
        'grant_type': 'refresh_token'
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=payload, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()
        return data['access_token']


def _generate_xoauth2_string(username: str, access_token: str) -> str:
    # Format: user=<email>^Aauth=Bearer <token>^A^A where ^A is ctrl-a
    auth_string = f'user={username}\x01auth=Bearer {access_token}\x01\x01'
    return base64.b64encode(auth_string.encode()).decode()


async def send_email(subject: str, body: str, to: Optional[str] = None):
    """Send an email via Gmail using OAuth2 access token and XOAUTH2 authentication.

    This method fetches an access token using the refresh token and then uses
    an SMTP connection with AUTH XOAUTH2 to send the message.
    """
    to = to or settings.GMAIL_USER
    access_token = await _get_access_token()

    # Create MIME message
    msg = MIMEMultipart()
    msg['From'] = settings.GMAIL_USER
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    auth_b64 = _generate_xoauth2_string(settings.GMAIL_USER, access_token)

    def _sync_send():
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.docmd('AUTH', 'XOAUTH2 ' + auth_b64)
        server.sendmail(settings.GMAIL_USER, [to], msg.as_string())
        server.quit()

    await asyncio.to_thread(_sync_send)
