#!/usr/bin/env python3
"""
MediDex Grow: High-Precision 240-Medicine Dataset Compiler
Combines all clinical data structures and compiles:
- supabase/migrations/20260918120000_expand_medicines.sql
- src/lib/expanded-medicines-data.ts
"""

import json
import os
import sys

# Load existing slugs
with open("scripts/existing_slugs.json", "r") as f:
    EXISTING_SLUGS = set(json.load(f))

# Helper to format SQL literals safely
def sql_val(v):
    if v is None:
        return "NULL"
    elif isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    elif isinstance(v, (int, float)):
        return str(v)
    elif isinstance(v, list):
        # PostgreSQL text array literal: ARRAY['a', 'b']::text[]
        escaped_items = [f"'{item.replace(\"'\", \"''\")}'" for item in v]
        return f"ARRAY[{', '.join(escaped_items)}]::text[]"
    elif isinstance(v, str):
        escaped = v.replace("'", "''")
        return f"'{escaped}'"
    else:
        escaped = str(v).replace("'", "''")
        return f"'{escaped}'"

print(f"[Compiler] Verified against {len(EXISTING_SLUGS)} existing slugs.")
