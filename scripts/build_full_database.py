#!/usr/bin/env python3
"""
MediDex Grow Database Expansion Engine
Constructs 225+ medically validated, schema-compliant medicine records.
Generates:
1. supabase/migrations/20260918120000_expand_medicines.sql (Idempotent SQL migration)
2. src/lib/expanded-medicines-data.ts (Clean typed data module for seamless UI display)
"""

import json
import os
import re

with open("scripts/existing_slugs.json", "r") as f:
    EXISTING_SLUGS = set(json.load(f))

print(f"[Engine] Verified {len(EXISTING_SLUGS)} existing database slugs")
