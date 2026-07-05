"""
Rate limiting setup using SlowAPI.

Provides a global limiter instance that can be applied to endpoints.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a limiter that uses the client's IP address as the key
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])