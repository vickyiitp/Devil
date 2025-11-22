from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict

# Simple in-memory rate limit store. For production use Redis.
rate_limit_store: Dict[str, List[datetime]] = defaultdict(list)


def check_rate_limit(client_ip: str, limit_per_minute: int = 20) -> bool:
    now = datetime.now()
    cutoff = now - timedelta(minutes=1)

    # Clean old entries
    rate_limit_store[client_ip] = [ts for ts in rate_limit_store[client_ip] if ts > cutoff]

    if len(rate_limit_store[client_ip]) >= limit_per_minute:
        return False

    rate_limit_store[client_ip].append(now)
    return True


def sanitize_input(text: str) -> str:
    if not text:
        return ''
    dangerous_patterns = ["<script", "javascript:", "onerror=", "onclick="]
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = sanitized.replace(pattern, "")
    return sanitized.strip()
