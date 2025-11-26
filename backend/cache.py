import os
import json
import time
from functools import wraps

REDIS_URL = os.getenv("REDIS_URL")
CACHING_ENABLED = False

_mem_cache = {}

try:
    if REDIS_URL:
        import redis
        _redis = redis.from_url(REDIS_URL)
        # simple ping to confirm availability
        _redis.ping()
        CACHING_ENABLED = True
    else:
        _redis = None
except Exception:
    _redis = None

if _redis is None:
    # memory fallback
    CACHING_ENABLED = True


def _mem_get(key):
    entry = _mem_cache.get(key)
    if not entry:
        return None
    value, expire = entry
    if expire is not None and time.time() > expire:
        del _mem_cache[key]
        return None
    return value


def _mem_set(key, value, ttl=None):
    expire = time.time() + ttl if ttl else None
    _mem_cache[key] = (value, expire)


def cache_result(ttl: int = 60):
    """Decorator to cache function results in Redis (if available) or memory."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                key = f"{func.__module__}.{func.__name__}:{args}:{kwargs}"
                if _redis:
                    raw = _redis.get(key)
                    if raw:
                        return json.loads(raw)
                    result = func(*args, **kwargs)
                    _redis.set(key, json.dumps(result), ex=ttl)
                    return result
                else:
                    raw = _mem_get(key)
                    if raw is not None:
                        return raw
                    result = func(*args, **kwargs)
                    _mem_set(key, result, ttl)
                    return result
            except Exception:
                # on any cache error fall back to computing
                return func(*args, **kwargs)
        return wrapper
    return decorator
