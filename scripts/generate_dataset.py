#!/usr/bin/env python3
"""
Full Dataset Generator for MediDex Grow
Generates 240+ verified medicines with rich clinical, pharmacological, and educational fields.
Validates against existing slugs and outputs:
1. supabase/migrations/20260918120000_expand_medicines.sql
2. src/lib/expanded-medicines-data.ts
"""

import json
import os
import sys

# Load existing slugs to guarantee 0% collision
with open("scripts/existing_slugs.json", "r") as f:
    EXISTING_SLUGS = set(json.load(f))

print(f"Loaded {len(EXISTING_SLUGS)} existing slugs from DB")
