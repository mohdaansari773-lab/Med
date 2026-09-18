#!/usr/bin/env python3
"""
Builds clinical records for Categories 3, 4, and 5:
- Cat 3: Antifungals, Antivirals & Antiparasitics (25 medicines)
- Cat 4: Cardiovascular & Antihypertensives (30 medicines)
- Cat 5: Hemostasis, Anticoagulants & Antiarrhythmics (20 medicines)
Total: 75 medicines
"""

import json

def r(slug, generic, display, active, salt, cat, desc,
      strengths, forms, routes, moa, pd,
      abs_pk, dist_pk, met_pk, exc_pk, bio, hl, pb, onset, dur,
      ind, contra, warn, cae, sae, interact, mon,
      preg, lact, ped, ger, ren, hep,
      adv, disadv, kpts, trick, suffix, pen, phi):
    return {
        "slug": slug, "generic_name": generic, "display_name": display,
        "active_ingredient": active, "salt": salt, "category": cat, "description": desc,
        "strengths": strengths, "dosage_forms": forms, "routes": routes,
        "mechanism_of_action": moa, "pharmacodynamics": pd,
        "absorption": abs_pk, "distribution": dist_pk, "metabolism": met_pk, "excretion": exc_pk,
        "bioavailability": bio, "half_life": hl, "protein_binding": pb,
        "onset": onset, "duration": dur,
        "indications": ind, "contraindications": contra, "warnings": warn,
        "common_adverse_effects": cae, "serious_adverse_effects": sae,
        "drug_interactions": interact, "monitoring": mon,
        "pregnancy": preg, "lactation": lact, "pediatric": ped, "geriatric": ger,
        "renal": ren, "hepatic": hep,
        "advantages": adv, "disadvantages": disadv, "key_points": kpts,
        "memory_trick": trick, "key_suffix": suffix,
        "pronunciation_en": pen, "pronunciation_hi": phi,
        "status": "active", "verification_status": "verified"
    }

print("[Builder 3-5] Loading records...")
