"""
Gemini Service (replaces GPT-4)
────────────────────────────────
Uses Google Gemini 1.5 Flash (FREE tier) for:
1. Prompt Refinement Agent
2. Marketing Copy Generation (Brand Persona governed)

Get free API key: https://aistudio.google.com/app/apikey
Free limits: 15 requests/min, 1500 requests/day
"""

import google.generativeai as genai
from config import settings
from templates.brand_personas import PERSONA_TEMPLATES, PLATFORM_GUIDELINES

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-2.5-flash")


# ── 1. Prompt Refinement Agent ───────────────────────────────────────────────

REFINEMENT_SYSTEM = (
    "You are an expert AI image prompt engineer. "
    "Transform a short user brief into a single detailed Stable Diffusion prompt. "
    "Rules: Output ONLY the prompt string — no intro or explanation. "
    "Include: subject, setting, lighting, camera angle, mood, art style, quality tags (8k, photorealistic, cinematic). "
    "No copyrighted brand names. Under 200 words."
)


def refine_prompt(brief: str, persona: str, platform: str) -> str:
    persona_data = PERSONA_TEMPLATES.get(persona, PERSONA_TEMPLATES["Professional"])
    platform_data = PLATFORM_GUIDELINES.get(platform, PLATFORM_GUIDELINES["Instagram"])

    prompt = (
        f"{REFINEMENT_SYSTEM}\n\n"
        f"User brief: \"{brief}\"\n"
        f"Brand tone: {persona_data['tone_descriptor']}\n"
        f"Platform image style: {platform_data['image_style']}\n\n"
        "Generate the refined image prompt:"
    )
    return model.generate_content(prompt).text.strip()


# ── 2. Marketing Copy Generator ───────────────────────────────────────────────

def generate_marketing_copy(brief: str, persona: str, platform: str) -> str:
    persona_data = PERSONA_TEMPLATES.get(persona, PERSONA_TEMPLATES["Professional"])
    platform_data = PLATFORM_GUIDELINES.get(platform, PLATFORM_GUIDELINES["Instagram"])

    prompt = (
        f"{persona_data['system_prompt']}\n\n"
        f"Product/Campaign Brief: \"{brief}\"\n"
        f"Platform Instructions: {platform_data['copy_instruction']}\n\n"
        "Write the marketing copy now:"
    )
    return model.generate_content(prompt).text.strip()
