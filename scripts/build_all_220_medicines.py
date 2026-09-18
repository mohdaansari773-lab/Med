#!/usr/bin/env python3
"""
MediDex Grow: Complete 220+ Medicine Dataset Compiler
Generates:
1. supabase/migrations/20260918120000_expand_medicines.sql
2. src/lib/expanded-medicines-data.ts
"""

import json
import os
import sys

# Verify against existing slugs
with open("scripts/existing_slugs.json", "r") as f:
    EXISTING = set(json.load(f))

print(f"Loaded {len(EXISTING)} existing slugs.")
