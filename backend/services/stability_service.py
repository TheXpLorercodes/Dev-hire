"""
Stability AI Service
────────────────────
Calls the Stability AI REST API (Stable Diffusion XL) to generate images.
Saves the result locally or returns the URL depending on config.
"""

import requests
import base64
import os
import uuid
from pathlib import Path
from config import settings

STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

# Ensure static dir exists
Path(settings.static_dir).mkdir(parents=True, exist_ok=True)


def generate_image(refined_prompt: str, job_id: str) -> str:
    """
    Generate an image using Stability AI.
    Returns a local relative URL path to the saved image.
    Raises on API error.
    """
    headers = {
        "Authorization": f"Bearer {settings.stability_api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "text_prompts": [
            {"text": refined_prompt, "weight": 1.0},
            {"text": "blurry, low quality, deformed, watermark, text, ugly, duplicate", "weight": -1.0},
        ],
        "cfg_scale": 7,
        "height": 1024,
        "width": 1024,
        "steps": 30,
        "samples": 1,
        "style_preset": "photographic",
    }

    response = requests.post(STABILITY_API_URL, headers=headers, json=payload, timeout=120)

    if response.status_code != 200:
        err = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
        raise RuntimeError(f"Stability AI error {response.status_code}: {err}")

    data = response.json()
    image_b64 = data["artifacts"][0]["base64"]
    image_bytes = base64.b64decode(image_b64)

    # Save locally
    filename = f"{job_id}.png"
    filepath = os.path.join(settings.static_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return f"/static/generated/{filename}"
