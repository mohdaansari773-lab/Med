#!/usr/bin/env python3
"""
MediDex Grow: Clinical Dataset Pipeline
Generates medically validated, structured clinical records for Parts 1, 2, 3, and 4
and produces the unified master dataset `scripts/all_expanded_medicines.json`.
"""

import json
import os

print("[Pipeline] Starting master dataset generation...")
