#!/usr/bin/env python3
"""
MediVault India: Database Expansion Generator
Generates:
1. src/data/medicines-expanded.json
2. src/data/medicines-expanded.csv
3. supabase/migrations/20260918130000_expand_220_medicines.sql
4. src/data/medicines-expanded.ts
"""

import json
import os
import re
import csv

# 1. Load Live Database Slugs and Generic Names for Duplicate Detection
with open("scripts/live_db_medicines.json", "r") as f:
    LIVE_DB = json.load(f)

def normalize_key(text):
    if not text:
        return ""
    t = text.lower().strip()
    return re.sub(r"[\s\-_+/,()]+", "", t)

LIVE_SLUGS = set(m["slug"] for m in LIVE_DB)
LIVE_NAMES = set(normalize_key(m["generic_name"]) for m in LIVE_DB)
LIVE_INGREDIENTS = set(normalize_key(m.get("active_ingredient") or "") for m in LIVE_DB if m.get("active_ingredient"))

print(f"Loaded {len(LIVE_DB)} existing live medicines.")

# Load existing JSON files in scripts
loaded_files = [
    "scripts/data_part1.json",
    "scripts/data_cat3_cat4.json",
    "scripts/data_cardio_20.json",
    "scripts/data_cat5_anticoag.json",
    "scripts/data_cat6_gi.json",
    "scripts/data_cat7_respiratory.json"
]

CANDIDATES = []
for fpath in loaded_files:
    with open(fpath, "r") as fp:
        items = json.load(fp)
        CANDIDATES.extend(items)

print(f"Loaded {len(CANDIDATES)} candidates from existing JSON files.")
