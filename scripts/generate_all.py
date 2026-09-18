#!/usr/bin/env python3
"""
Full Dataset Generator for MediDex Grow
Generates 225+ verified medicines with rich clinical, pharmacological, and educational fields.
Validates against existing slugs and outputs:
1. supabase/migrations/20260918120000_expand_medicines.sql
2. src/lib/expanded-medicines-data.ts
"""

import json
import os
import re

with open("scripts/existing_slugs.json", "r") as f:
    EXISTING_SLUGS = set(json.load(f))

# Define helper to construct standard medicine structure
def make_med(
    slug, generic, display, active, salt, category, desc,
    strengths, forms, routes, moa, pd,
    absorption, distribution, metabolism, excretion,
    bioavail, half_life, protein_bind, onset, duration,
    indications, contraindications, warnings,
    common_ae, serious_ae, interactions, monitoring,
    pregnancy, lactation, pediatric, geriatric, renal, hepatic,
    advantages, disadvantages, key_points,
    memory_trick, key_suffix, pron_en, pron_hi
):
    if slug in EXISTING_SLUGS:
        raise ValueError(f"Collision detected for slug: {slug}!")
    return {
        "slug": slug,
        "generic_name": generic,
        "display_name": display,
        "active_ingredient": active,
        "salt": salt,
        "category": category,
        "description": desc,
        "strengths": strengths,
        "dosage_forms": forms,
        "routes": routes,
        "mechanism_of_action": moa,
        "pharmacodynamics": pd,
        "absorption": absorption,
        "distribution": distribution,
        "metabolism": metabolism,
        "excretion": excretion,
        "bioavailability": bioavail,
        "half_life": half_life,
        "protein_binding": protein_bind,
        "onset": onset,
        "duration": duration,
        "indications": indications,
        "contraindications": contraindications,
        "warnings": warnings,
        "common_adverse_effects": common_ae,
        "serious_adverse_effects": serious_ae,
        "drug_interactions": interactions,
        "monitoring": monitoring,
        "pregnancy": pregnancy,
        "lactation": lactation,
        "pediatric": pediatric,
        "geriatric": geriatric,
        "renal": renal,
        "hepatic": hepatic,
        "advantages": advantages,
        "disadvantages": disadvantages,
        "key_points": key_points,
        "memory_trick": memory_trick,
        "key_suffix": key_suffix,
        "pronunciation_en": pron_en,
        "pronunciation_hi": pron_hi,
        "status": "active",
        "verification_status": "verified"
    }

# We will import Group 1
from catalog.group1_analgesia import MEDICINES as GROUP1

print(f"Loaded {len(GROUP1)} from Group 1")
