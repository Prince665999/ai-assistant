"""
Email service for sending chat conversations to users.
"""

"""
Email service for sending chat conversations to users.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
import threading
import queue
import time
from typing import Optional
from datetime import datetime

from app.config import settings  # Make sure this is imported

# ... rest of the file remains the same

# Simple in-memory email queue for background sending
_email_queue = queue.Queue()

def send_email_background(to_email: str, subject: str, body: str, html_body: Optional[str] = None):
    """
    Add email to queue for background sending.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text body
        html_body: HTML body (optional)
    """
    if not settings.EMAIL_ENABLED:
        print("ℹ️ Email sending is disabled in settings")
        return
    
    if not settings.EMAIL_USERNAME or not settings.EMAIL_PASSWORD:
        print("⚠️ Email credentials not configured. Email not sent.")
        return
    
    _email_queue.put({
        "to_email": to_email,
        "subject": subject,
        "body": body,
        "html_body": html_body
    })
    print(f"📧 Email queued for: {to_email}")


def send_email_sync(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
    """
    Send email synchronously (blocking).
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text body
        html_body: HTML body (optional)
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = settings.EMAIL_FROM or settings.EMAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text body
        part1 = MIMEText(body, 'plain')
        msg.attach(part1)
        
        # Add HTML body if provided
        if html_body:
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
        
        # Connect to SMTP server
        if settings.EMAIL_USE_TLS:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        
        # Login and send
        server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to: {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False


def format_chat_email(user_message: str, assistant_response: str, tool_used: Optional[str] = None) -> tuple:
    """
    Format the chat conversation into email body.
    
    Args:
        user_message: The user's question
        assistant_response: The assistant's answer
        tool_used: Which tool was used (if any)
    
    Returns:
        Tuple of (plain_text_body, html_body)
    """
    timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    
    # Plain text body
    plain_body = f"""
Chat Conversation
{'-' * 50}
Date: {timestamp}

You asked:
{user_message}

Assistant response:
{assistant_response}

{f'Tool used: {tool_used}' if tool_used else ''}
{'-' * 50}
This email was sent automatically by the AI Assistant.
    """
    
    # HTML body
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
        }}
        .message {{
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }}
        .user-message {{
            border-left-color: #4CAF50;
        }}
        .assistant-message {{
            border-left-color: #667eea;
        }}
        .timestamp {{
            color: #888;
            font-size: 0.9em;
        }}
        .tool-used {{
            background: #fff3cd;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            font-size: 0.9em;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            color: #888;
            font-size: 0.8em;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h2>🤖 AI Assistant Chat</h2>
        <div class="timestamp">{timestamp}</div>
    </div>
    <div class="content">
        <div class="message user-message">
            <strong>You asked:</strong>
            <p>{user_message}</p>
        </div>
        <div class="message assistant-message">
            <strong>Assistant response:</strong>
            <p>{assistant_response}</p>
        </div>
        {f'<div class="tool-used">🔧 Tool used: {tool_used}</div>' if tool_used else ''}
        <div class="footer">
            <p>This email was sent automatically by the AI Assistant.</p>
        </div>
    </div>
</body>
</html>
    """
    
    return plain_body, html_body


def send_chat_email(to_email: str, user_message: str, assistant_response: str, tool_used: Optional[str] = None):
    """
    Send a chat conversation as email.
    
    Args:
        to_email: Recipient email address
        user_message: The user's question
        assistant_response: The assistant's answer
        tool_used: Which tool was used (if any)
    """
    subject = f"AI Assistant: Your question answered"
    
    plain_body, html_body = format_chat_email(user_message, assistant_response, tool_used)
    
    if settings.EMAIL_QUEUE_ENABLED:
        # Queue for background sending
        send_email_background(to_email, subject, plain_body, html_body)
    else:
        # Send synchronously
        send_email_sync(to_email, subject, plain_body, html_body)


# Background worker to process email queue
def email_worker():
    """
    Background thread that processes the email queue.
    """
    print("📧 Email worker started")
    while True:
        try:
            # Get email from queue (blocking with timeout)
            email_data = _email_queue.get(timeout=1)
            
            # Send email
            success = send_email_sync(
                email_data["to_email"],
                email_data["subject"],
                email_data["body"],
                email_data["html_body"]
            )
            
            if success:
                print(f"📧 Email sent to: {email_data['to_email']}")
            else:
                print(f"❌ Failed to send email to: {email_data['to_email']}")
            
            # Mark as done
            _email_queue.task_done()
            
        except queue.Empty:
            # No emails in queue, continue
            continue
        except Exception as e:
            print(f"❌ Email worker error: {str(e)}")
            time.sleep(1)


# Start email worker thread
_email_thread_started = False

def start_email_worker():
    """
    Start the email worker thread.
    """
    global _email_thread_started
    if not _email_thread_started and settings.EMAIL_ENABLED:
        thread = threading.Thread(target=email_worker, daemon=True)
        thread.start()
        _email_thread_started = True
        print("📧 Email worker thread started")