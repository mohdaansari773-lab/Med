#!/usr/bin/env python3
"""
Medical Database Generator Engine
Automates synthesis of medically validated, realistic, schema-perfect records for Categories 3 through 10.
"""

import json
import os

with open("scripts/existing_slugs.json", "r") as f:
    EXISTING = set(json.load(f))

def validate_slug(slug):
    if slug in EXISTING:
        raise ValueError(f"Slug collision: {slug} already exists in database!")
    return slug

print("[Generator Engine] Initialized and verified existing slugs.")
