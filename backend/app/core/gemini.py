import asyncio
import time

from google import genai
from google.genai import types

from ..config import get_settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)
settings = get_settings()

_client: genai.Client | None = None
INVALID_KEY_MARKERS = ("API_KEY_INVALID", "API key not valid")


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


class GeminiRateLimiter:
    """Simple async token bucket to keep calls below configured RPM."""

    def __init__(self, rpm: int = 14):
        self.min_interval = 60.0 / rpm
        self._last_call = 0.0
        self._lock = asyncio.Lock()

    async def wait(self) -> None:
        async with self._lock:
            now = time.monotonic()
            wait_time = self.min_interval - (now - self._last_call)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self._last_call = time.monotonic()


_rate_limiter = GeminiRateLimiter(rpm=settings.gemini_rpm_limit)


def normalize_gemini_exception(exc: Exception) -> Exception:
    message = str(exc)
    if any(marker in message for marker in INVALID_KEY_MARKERS):
        return ValueError(
            "Gemini API key is invalid. Update GEMINI_API_KEY in backend/.env and restart the backend."
        )
    return exc


async def call_gemini(
    prompt: str,
    system: str | None = None,
    temperature: float = 0.1,
    max_tokens: int = 2048,
    json_mode: bool = False,
) -> str:
    """Single entry point for Gemini calls with async offloading and rate limiting."""
    await _rate_limiter.wait()
    client = get_client()

    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
    )
    if system:
        config.system_instruction = system
    if json_mode:
        config.response_mime_type = "application/json"

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt,
            config=config,
        )
        return response.text or ""
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise normalize_gemini_exception(exc) from exc
