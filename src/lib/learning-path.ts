/** Structured pharmacology learning path. Every topic is clickable and opens AI Study Mode. */
export type PathTopic = { title: string; blurb: string };
export type PathStage = {
  id: "beginner" | "student";
  title: string;
  description: string;
  topics: PathTopic[];
};

export const LEARNING_PATH: PathStage[] = [
  {
    id: "beginner",
    title: "Beginner foundations",
    description: "Start here if pharmacology words feel new. Thirteen short building blocks.",
    topics: [
      { title: "What is a medicine?", blurb: "Substance used to prevent, treat or diagnose illness." },
      { title: "Generic vs brand", blurb: "Same salt, different company name." },
      { title: "Salt / active ingredient", blurb: "The chemical that actually works." },
      { title: "Drug classification", blurb: "How medicines are grouped." },
      { title: "Therapeutic class", blurb: "Grouped by the condition treated." },
      { title: "Pharmacological class", blurb: "Grouped by how they work." },
      { title: "Mechanism of action", blurb: "The exact way a drug acts." },
      { title: "ADME", blurb: "Absorption, distribution, metabolism, excretion." },
      { title: "Pharmacokinetics", blurb: "What the body does to the drug." },
      { title: "Pharmacodynamics", blurb: "What the drug does to the body." },
      { title: "Adverse effects", blurb: "Unwanted effects of a medicine." },
      { title: "Contraindications", blurb: "When a medicine must not be used." },
      { title: "Drug interactions", blurb: "What happens when drugs meet." },
    ],
  },
  {
    id: "student",
    title: "Student pharmacology",
    description: "System-wise and class-wise topics for pharmacy and medical students.",
    topics: [
      { title: "Autonomic pharmacology", blurb: "Sympathetic and parasympathetic drugs." },
      { title: "Cardiovascular pharmacology", blurb: "Heart and vessel drugs." },
      { title: "CNS pharmacology", blurb: "Brain and nervous system drugs." },
      { title: "Gastrointestinal pharmacology", blurb: "Gut, acid and motility drugs." },
      { title: "Respiratory pharmacology", blurb: "Asthma and COPD drugs." },
      { title: "Endocrine pharmacology", blurb: "Hormone-related drugs." },
      { title: "Antimicrobial pharmacology", blurb: "Antibiotics, antifungals, antivirals." },
      { title: "Chemotherapy", blurb: "Anticancer drug principles." },
      { title: "NSAIDs", blurb: "Non-steroidal anti-inflammatory drugs." },
      { title: "Antihistamines", blurb: "Allergy drugs, sedating and non-sedating." },
      { title: "Corticosteroids", blurb: "Anti-inflammatory steroid drugs." },
      { title: "Diuretics", blurb: "Drugs that increase urine output." },
      { title: "Antihypertensives", blurb: "Blood pressure lowering drugs." },
      { title: "Antidiabetics", blurb: "Blood sugar lowering drugs." },
      { title: "Anticoagulants", blurb: "Drugs that slow clotting." },
      { title: "Antiplatelets", blurb: "Drugs that stop platelets sticking." },
      { title: "Lipid-lowering drugs", blurb: "Statins and other cholesterol drugs." },
    ],
  },
];

/** Common-drug categories used across browsing surfaces. */
export const DRUG_CATEGORIES = [
  "Pain & Fever",
  "Acidity & GERD",
  "Nausea & Vomiting",
  "Diarrhea",
  "Constipation",
  "Allergy",
  "Cough",
  "Cold",
  "Asthma",
  "COPD",
  "Antibiotics",
  "Antifungals",
  "Antivirals",
  "Antiprotozoals",
  "Anthelmintics",
  "Diabetes",
  "Hypertension",
  "Heart",
  "Cholesterol",
  "Thyroid",
  "Vitamins",
  "Minerals",
  "Skin",
  "Eye",
  "Ear",
  "Nose",
  "Throat",
  "Neurology",
  "Psychiatry",
  "Emergency",
  "Women's Health",
  "Men's Health",
] as const;
