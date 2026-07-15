import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or base64.urlsafe_b64encode(os.urandom(16)).decode()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"{salt}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, stored_hash: str) -> bool:
    salt, expected = stored_hash.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt).split("$", 1)[1], expected)


def create_token(payload: dict[str, Any], expires_in_seconds: int = 3600) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    body = {**payload, "exp": int(time.time()) + expires_in_seconds}
    header_b64 = _encode(header)
    body_b64 = _encode(body)
    signature = hmac.new(SECRET_KEY.encode(), f"{header_b64}.{body_b64}".encode(), hashlib.sha256).digest()
    return f"{header_b64}.{body_b64}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def _encode(value: dict[str, Any]) -> str:
    return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")
