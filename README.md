# MediVault Reference

Bilkul. Lovable ke liye main prompt ko implementation-focused rakhunga—UI ke saath proper database schema, admin/update system, medicine search, classification, pronunciation, Explain, ADME, Drug Memory, quizzes aur future scalability.

Important: Lovable ko ek hi baar mein “all medicines in India” generate karne ko mat bolo. Pehle architecture + verified starter dataset banao, phir database/import pipeline se expand karo.

Build a production-quality, scalable, mobile-first web application called:

MEDIVAULT INDIA

Tagline:

"Medicine • Pharmacology • Learning • Reference"

Use a clean, professional medical-reference design. This is NOT a simple landing page and NOT a static medicine list. Build the actual application architecture, database schema, reusable components, navigation, search, learning modules and admin-ready system.

The application must be designed so that the medicine database can grow from a small verified starter dataset to thousands of medicines without rebuilding the application.

==================================================

1. PRODUCT PURPOSE

   ==================================================

MediVault India is an educational medicine reference and pharmacology learning platform focused on medicines used/marketed in India.

Users should be able to:

- Search medicines

- Search generic names

- Search brand names

- Search salt/active ingredients

- Browse medicine classifications

- Browse therapeutic and pharmacological classes

- Learn common medicines

- Learn medical terminology

- Hear correct medicine pronunciations

- Use an "Explain" button for difficult terms

- Learn ADME

- Learn pharmacokinetics and pharmacodynamics

- Learn drug classes

- Memorize medicines using safe mnemonics

- Study flashcards

- Take quizzes

- Compare medicines

- Save favorites

- View recently visited medicines

- Track learning progress

- Use an AI explanation assistant

- Update and expand the medicine database later

This is an educational/reference application, not a diagnosis or individualized prescribing system.

==================================================

2. TECH STACK

Use the Lovable-supported modern web stack.

Preferred:

Frontend:

- React

- TypeScript

- Tailwind CSS

- Modern component architecture

Backend/database:

- Supabase

- PostgreSQL

Authentication:

- Supabase Auth

Storage:

- Supabase Storage where required

AI:

- Gemini API through a secure server-side/edge-function integration.

IMPORTANT:

Never expose Gemini API keys or other secret keys in frontend code.

Use environment variables/secrets and server-side/edge functions for AI requests.

==================================================

3. DESIGN

Create a premium medical-reference UI.

Style:

- Professional

- Modern

- Clean

- Minimal

- Trustworthy

- Mobile-first

- Android-friendly

- Responsive

- Accessible

- Fast

Support:

- Light mode

- Dark mode

- Responsive mobile/tablet/desktop

- Bottom navigation on mobile

- Sidebar/top navigation on desktop

- Search-first design

- Cards

- Tabs

- Accordions

- Badges

- Progress indicators

- Skeleton loading

- Empty states

- Error states

Do NOT make it look like a generic AI chatbot.

==================================================

4. MAIN NAVIGATION

Create:

🏠 Home

💊 Medicines

🧬 Classes

📖 Medical Terms

🧠 Drug Memory

🃏 Flashcards

📝 Quiz

🔊 Pronunciation

🔬 ADME

⚖️ Compare

⭐ Favorites

📊 My Learning

Also provide:

⚙️ Settings

ℹ️ About

🔐 Admin, only for authorized users

==================================================

5. HOME PAGE

Create a dashboard with:

MediVault India

"Medicine & Pharmacology Reference"

Large global search:

"Search medicine, generic, brand, salt or medical term..."

Quick actions:

💊 Medicines

🧬 Drug Classes

📖 Medical Dictionary

🧠 Drug Memory

🃏 Flashcards

📝 Quiz

🔊 Pronunciation

🔬 ADME

Sections:

- Common Drugs

- Popular Classes

- Recently Viewed

- Continue Learning

- Favorites

- Review Today

- Recommended Learning

==================================================

6. MEDICINE DATABASE

Use Supabase/PostgreSQL.

DO NOT hardcode medicine data inside React components.

Create a scalable relational database.

Suggested tables:

medicines

medicine_active_ingredients

brands

manufacturers

drug_classes

medicine_classifications

medical_terms

pronunciations

references

medicine_references

drug_interactions

mnemonics

flashcards

quiz_questions

user_favorites

recently_viewed

learning_progress

review_schedule

profiles

admin_audit_logs

Use proper foreign keys and indexes.

==================================================

7. MEDICINE TABLE

Create fields for:

id

generic_name

display_name

active_ingredient

salt

description

strength

dosage_forms

routes

mechanism_of_action

pharmacodynamics

ADME:

absorption

distribution

metabolism

excretion

Pharmacokinetics:

bioavailability

half_life

protein_binding

volume_of_distribution

clearance

onset

duration

Clinical information:

indications

contraindications

warnings

precautions

common_adverse_effects

serious_adverse_effects

drug_interactions

food_interactions

monitoring

storage

patient_counselling

Special populations:

pregnancy

lactation

pediatric

geriatric

renal

hepatic

Educational:

advantages

disadvantages

key_points

memory_trick

key_suffix

related_medicines

Data quality:

status

verification_status

last_verified

data_version

created_at

updated_at

==================================================

8. BRAND DATABASE

Create separate brand records.

Fields:

id

brand_name

medicine_id

manufacturer_id

composition

strength

dosage_form

route

source

verified

last_verified

IMPORTANT:

Never assume a brand's composition.

Brand information must be linked to verified composition data.

A single generic medicine can have many brands.

==================================================

9. MANUFACTURER DATABASE

Create:

manufacturers

Fields:

id

name

country

website

status

Allow multiple brands per manufacturer.

==================================================

10. MEDICINE SEARCH

Create a powerful global search.

Search by:

- Generic name

- Brand name

- Salt

- Active ingredient

- Medical term

- Drug class

- Manufacturer

- Synonym

Features:

- Partial matching

- Fuzzy matching

- Typo tolerance

- Debounced search

- Search suggestions

- Recent searches

- Popular searches

Search result card:

Medicine name

Generic

Salt

Class

Short description

Pronunciation

[Explain]

[View]

==================================================

11. BRAND → GENERIC

If user searches a brand:

Example:

"Crocin"

Show:

Brand

↓

Active ingredient

↓

Generic

↓

Classification

↓

Medicine profile

Also support:

Generic → Brands

Salt → Generic

Salt → Brands

Never fabricate brand composition.

==================================================

12. MEDICINE PROFILE

Create a professional medicine detail page.

Example:

PARACETAMOL

pa-ra-SEE-ta-mol

Analgesic • Antipyretic

Buttons:

🔊 Listen

💡 Explain

🧠 Remember

⚖️ Compare

⭐ Favorite

Information sections:

Overview

Generic

Salt / Active Ingredient

Brand Names

Manufacturer

Strength

Dosage Forms

Routes

Therapeutic Classification

Pharmacological Classification

Mechanism of Action

Pharmacodynamics

ADME

Pharmacokinetics

Uses

Contraindications

Warnings

Precautions

Common Adverse Effects

Serious Adverse Effects

Interactions

Pregnancy

Lactation

Pediatric

Geriatric

Renal

Hepatic

Monitoring

Counselling

Advantages

Disadvantages

References

Last Verified

Use accordions/tabs to keep the page readable.

==================================================

13. CLASSIFICATION SYSTEM

Classification is a core feature.

Explain classification in simple terms:

"Classification means grouping medicines according to their therapeutic use, pharmacological action, mechanism, chemical structure or other standardized criteria."

Support:

Therapeutic Class

Pharmacological Class

Mechanism-based Class

Chemical Class

ATC Classification where available

Create hierarchy:

Medicine

↓

Therapeutic Class

↓

Pharmacological Class

↓

Subclass

↓

Generic Medicine

↓

Brand

Example:

Losartan

↓

Cardiovascular Medicine

↓

Antihypertensive

↓

Renin-Angiotensin System Drug

↓

ARB

↓

Losartan

Every classification node should be clickable.

==================================================

14. DRUG CLASS PAGES

Each class should have a dedicated page.

Example:

ANALGESICS

Show:

What is an analgesic?

Simple explanation:

"Analgesic ek medicine hoti hai jo pain/dard ko reduce ya relieve karne ke liye use hoti hai."

Medical explanation:

Detailed definition.

Types:

Non-opioid analgesics

NSAIDs

Opioid analgesics

Other centrally acting analgesics

Show:

Examples

Mechanisms

Uses

Important adverse effects

Contraindications

Interactions

Advantages

Disadvantages

Related classes

Related medicines

Buttons:

💡 Explain

🔊 Pronounce

🧠 Remember

🃏 Flashcards

📝 Quiz

==================================================

15. COMMON DRUGS

Create:

"Common Drugs"

Categories:

Pain & Fever

Acidity & GERD

Vomiting/Nausea

Diarrhea

Constipation

Allergy

Cough & Cold

Asthma/COPD

Antibiotics

Antifungals

Antivirals

Antiprotozoals

Anthelmintics

Diabetes

Blood Pressure

Heart

Cholesterol

Thyroid

Vitamins & Minerals

Skin

Eye

ENT

Neurology

Psychiatry

Emergency

Women's Health

Men's Health

Seed representative medicines such as:

Paracetamol

Ibuprofen

Diclofenac

Naproxen

Amoxicillin

Amoxicillin + Clavulanic Acid

Azithromycin

Doxycycline

Cefixime

Ceftriaxone

Metronidazole

Omeprazole

Pantoprazole

Ondansetron

Cetirizine

Loratadine

Salbutamol

Metformin

Glimepiride

Amlodipine

Losartan

Telmisartan

Atorvastatin

Rosuvastatin

Levothyroxine

Furosemide

Aspirin

Clopidogrel

Use only verified information.

Label these as:

"Starter / Common Medicine Database"

Do NOT claim this represents all medicines available in India.

==================================================

16. PRONUNCIATION SYSTEM

Every medicine and medical term should support:

English pronunciation

Easy phonetic pronunciation

Hindi-friendly pronunciation

IPA where available

Text-to-speech

Example:

PARACETAMOL

English:

pa-ra-SEE-ta-mol

Hindi-friendly:

पैरा-सी-टा-मोल

Buttons:

🔊 Listen

🐢 Slow

▶ Normal

Allow pronunciation data to be edited by authorized administrators.

Do not invent pronunciations.

==================================================

17. MEDICAL DICTIONARY

Create:

"Medical Terms"

Initial terms:

Analgesic

Antipyretic

NSAID

Antibiotic

Antiviral

Antifungal

Antihistamine

Antacid

PPI

Diuretic

Beta Blocker

ACE Inhibitor

ARB

Calcium Channel Blocker

Anticoagulant

Antiplatelet

Statin

Corticosteroid

Bronchodilator

Mucolytic

Expectorant

Antitussive

Sedative

Hypnotic

Antidepressant

Antipsychotic

Antiepileptic

Antiemetic

Laxative

Antiseptic

Disinfectant

Agonist

Antagonist

Receptor

Enzyme Inhibitor

Half-life

Bioavailability

Clearance

Volume of Distribution

ADME

Pharmacokinetics

Pharmacodynamics

Each term supports:

definition

simple_definition

hindi_explanation

hinglish_explanation

clinical_definition

pronunciation

related_terms

related_medicines

references

==================================================

18. UNIVERSAL "EXPLAIN" BUTTON

This is a major feature.

Add:

💡 Explain

to:

- Medicines

- Drug classes

- Medical terms

- ADME concepts

- Pharmacokinetic concepts

- Pharmacodynamic concepts

- Side effects

- Interactions

- Difficult words

Example:

[Explain] Analgesic

Modal:

ANALGESIC

Medical:

An analgesic is a medicine used to relieve pain.

Simple:

"Pain/dard kam karne wali medicine."

Hindi:

"Dard ko kam ya relieve karne wali dawa ko analgesic kehte hain."

Examples:

Paracetamol

Ibuprofen

Diclofenac

Related:

Antipyretic

NSAID

Opioid

Buttons:

Explain Simply

Explain in Hindi

Explain in Hinglish

Explain for Student

Explain in Detail

==================================================

19. AI EXPLAIN

Integrate Gemini through a secure backend/edge function.

AI should explain existing database content.

Flow:

User asks

↓

Search database

↓

Retrieve medicine/class/term data

↓

Retrieve references

↓

Gemini generates explanation

↓

Show explanation + source information

AI modes:

Beginner

Simple

Student

Healthcare Learner

Professional Reference

Languages:

English

Hindi

Hinglish

Future-ready for Urdu.

The AI must never invent medical facts when database/reference information is available.

If information cannot be verified:

"Information could not be verified from the available reference data."

==================================================

20. DRUG MEMORY

Create:

"Drug Memory"

Purpose:

Help users learn pharmacology.

Each medicine/class can have:

Memory trick

Mnemonic

Key feature

Key suffix

Related drugs

Flashcard

Quiz

Example:

LOSARTAN

Class:

ARB

Memory:

"-sartan → many ARBs"

Related:

Losartan

Valsartan

Telmisartan

Candesartan

Add warning:

"Mnemonic is a learning aid. Always verify the actual classification in the medicine record."

==================================================

21. DRUG SUFFIX SYSTEM

Create:

"Drug Name Patterns"

Examples:

-pril

→ Many ACE inhibitors

-sartan

→ ARBs

-olol

→ Many beta blockers

-statin

→ Statins

-prazole

→ PPIs

-cillin

→ Many penicillin antibiotics

-floxacin

→ Fluoroquinolones

-tidine

→ H2 receptor antagonists

-caine

→ Many local anesthetics

Clearly state:

"Drug-name suffixes are memory aids, not absolute classification rules. Exceptions exist."

==================================================

22. FLASHCARDS

Create interactive flashcards.

Examples:

Question:

"Which class does losartan belong to?"

Answer:

"ARB — Angiotensin II receptor blocker"

Controls:

✓ Know

↻ Review

✕ Don't Know

Track:

review count

difficulty

last reviewed

next review

==================================================

23. SPACED REPETITION

Implement a basic upgradeable spaced-repetition system.

Track:

first studied

last reviewed

review count

correct count

incorrect count

difficulty

next review date

Dashboard:

"Review Today"

==================================================

24. QUIZ SYSTEM

Create:

10-question quiz

20-question quiz

Drug Class quiz

Medicine quiz

Pronunciation quiz

Generic/Brand quiz

Salt quiz

ADME quiz

Pharmacology quiz

Medical Terms quiz

Question types:

Multiple choice

True/False

Matching

Fill in blank

After answer:

Correct/Incorrect

Correct answer

Short explanation

==================================================

25. ADME

Create dedicated:

"ADME"

A = Absorption

D = Distribution

M = Metabolism

E = Excretion

For every medicine show structured information.

Create visual cards:

ABSORPTION

↓

DISTRIBUTION

↓

METABOLISM

↓

EXCRETION

Also support:

Half-life

Bioavailability

Protein binding

Clearance

Volume of distribution

Provide:

Simple explanation

Student explanation

Detailed explanation

==================================================

26. PHARMACOKINETICS

Create a learning module:

"What the body does to the drug."

Include:

Absorption

Distribution

Metabolism

Excretion

Half-life

Bioavailability

Clearance

Volume of distribution

Protein binding

==================================================

27. PHARMACODYNAMICS

Create:

"What the drug does to the body."

Include:

Receptors

Agonists

Antagonists

Partial agonists

Enzyme inhibition

Dose-response

Therapeutic effects

Adverse effects

Use simple diagrams/cards where useful.

==================================================

28. MEDICINE COMPARISON

Allow users to compare 2 or more medicines.

Example:

Paracetamol vs Ibuprofen

Compare:

Generic

Salt

Class

Mechanism

Uses

ADME

Pharmacokinetics

Adverse effects

Contraindications

Interactions

Advantages

Disadvantages

Monitoring

Keep this educational.

Do not automatically recommend which medicine a specific person should take.

==================================================

29. DRUG INTERACTIONS

Create architecture for a future interaction checker.

User selects:

Drug A

Drug B

Show:

Interaction

Severity

Mechanism

Clinical significance

Professional consideration

Reference

Use verified interaction data only.

Never invent interactions.

==================================================

30. FAVORITES

Users can favorite:

Medicines

Drug classes

Medical terms

Flashcards

==================================================

31. RECENTLY VIEWED

Track:

Medicines

Classes

Medical terms

Show on home page.

==================================================

32. LEARNING DASHBOARD

Create:

"My Learning"

Display:

Medicines learned

Classes learned

Terms learned

Flashcards completed

Quiz scores

Weak topics

Review Today

Learning streak

Overall progress

==================================================

33. USER AUTHENTICATION

Implement Supabase Auth where appropriate.

Support:

Email/password

Google sign-in if available

User data:

Profile

Favorites

Recently viewed

Learning progress

Quiz history

Review schedule

Do not collect unnecessary personal/health information.

==================================================

34. ADMIN SYSTEM

Create an admin-ready dashboard.

Only authorized admin users can access it.

Admin capabilities:

Add medicine

Edit medicine

Deactivate medicine

Add brand

Edit brand

Add manufacturer

Add class

Edit class

Add medical term

Edit term

Add pronunciation

Edit pronunciation

Add mnemonic

Edit mnemonic

Add reference

Edit reference

Verify record

Set last verified date

Import CSV

Import JSON

Bulk update

View audit history

==================================================

35. DATA VERIFICATION

Every medicine record should support:

verification_status

last_verified

source

source_url

reviewed_by

data_version

updated_at

Possible statuses:

Draft

Under Review

Verified

Needs Update

Archived

Only verified records should be presented as verified medical reference information.

==================================================

36. DATABASE IMPORT

Build an import system for future large datasets.

Support:

CSV

JSON

Validate:

Required fields

Duplicate records

Invalid references

Missing classification

Invalid relationships

Do not overwrite verified records without confirmation.

==================================================

37. DATABASE SEARCH PERFORMANCE

Create indexes for:

generic_name

active_ingredient

salt

brand_name

class

medical_term

Use efficient queries.

Implement:

pagination

debounced search

lazy loading

caching where appropriate

==================================================

38. SAFETY

Display this disclaimer:

"Educational reference only. MediVault India does not replace a qualified doctor, pharmacist or other healthcare professional. Do not start, stop or change prescription medicines based solely on this application."

The application must NOT:

- Diagnose users

- Provide individualized prescriptions

- Encourage antibiotic misuse

- Invent doses

- Invent drug interactions

- Invent contraindications

- Invent brand compositions

- Present AI guesses as verified facts

For clinically consequential questions, advise consultation with a qualified healthcare professional.

==================================================

39. DOSAGE ARCHITECTURE

The database may support verified reference dosage information.

Each dosage record should support:

medicine

indication

age_group

dose

unit

frequency

route

duration

maximum_dose

renal_adjustment

hepatic_consideration

reference

Clearly distinguish:

"Reference dosage information"

from:

"Personalized medical advice."

Do not generate dosing instructions purely from AI.

==================================================

40. SOURCES AND REFERENCES

Create a reference system.

Each medicine should support multiple references.

Store:

source_name

source_type

source_url

publication/update date where available

access date

reference_notes

Prefer authoritative governmental, regulatory, pharmacological and established clinical sources.

==================================================

41. STARTER DATA

Create a limited verified starter dataset.

Do not fabricate thousands of medicines.

Use representative medicines from multiple classes, including:

Paracetamol Ibuprofen Diclofenac Naproxen Amoxicillin Amoxicillin + Clavulanic Acid Azithromycin Doxycycline Cefixime Ceftriaxone Metronidazole Omeprazole Pantoprazole Ondansetron Cetirizine Loratadine Salbutamol Metformin Glimepiride Amlodipine Losartan Telmisartan Atorvastatin Rosuvastatin Levothyroxine Furosemide Aspirin Clopidogrel

Verify all clinical information before inserting it.

Label:

"Starter / Common Medicine Database"

Do not call this "All medicines in India."

================================================== 42. MULTILINGUAL ARCHITECTURE

Start with:

English Hindi Hinglish

Prepare translation architecture for:

Urdu Additional Indian languages

Do not mix translations into database logic.

================================================== 43. ACCESSIBILITY

Support:

Readable fonts Large text option High contrast Keyboard navigation Screen reader labels Accessible buttons Audio pronunciation Simple language mode

================================================== 44. RESPONSIVE DESIGN

The application must work properly on:

Android phones iPhones Tablets Desktop Large screens

Prioritize Android mobile experience.

================================================== 45. PWA

Make the application installable as a Progressive Web App if supported.

Include:

App icon Manifest Installable experience Offline-ready architecture

If full offline medicine database is not implemented initially, prepare the architecture for future offline support.

================================================== 46. ERROR HANDLING

Handle:

Database unavailable Network failure Medicine not found Invalid search AI unavailable Missing data Authentication errors Unauthorized admin access Import errors

Show friendly messages.

================================================== 47. SECURITY

Implement:

Supabase Row Level Security

Users can only modify their own:

Favorites Learning progress Recent history

Admin-only access to medical data editing.

Never expose:

API keys Service-role keys Admin credentials

in frontend code.

================================================== 48. VERSIONING

Display:

MediVault India Version 1.0.0

Database: Version 1.0

Prepare architecture for:

1.1 1.2 2.0 etc.

================================================== 49. FUTURE UPGRADE ARCHITECTURE

Design the application so future versions can add:

Version 2: Advanced interaction checker More medicine records Advanced spaced repetition More languages

Version 3: Voice search Medicine-strip OCR Barcode scanning Offline medicine database Advanced learning analytics

Version 4: Professional healthcare learner mode Advanced pharmacology tools Clinical calculators Expanded verified database

Do not implement unsafe clinical automation prematurely.

================================================== 50. FINAL QUALITY CHECK

Before completing the build:

Test all routes

Test navigation

Test mobile UI

Test desktop UI

Test dark mode

Test medicine search

Test generic search

Test brand search

Test salt search

Test classification

Test medical dictionary

Test pronunciation

Test Explain button

Test Drug Memory

Test flashcards

Test quizzes

Test ADME

Test medicine comparison

Test favorites

Test recently viewed

Test learning dashboard

Test authentication

Test admin authorization

Test database queries

Test Supabase RLS

Test AI integration

Ensure API keys are never exposed

Ensure no fabricated medical information is presented as verified

Ensure references are displayed

Ensure disclaimers are visible

Fix all TypeScript errors

Fix all runtime errors

Fix all console errors

Make the application production-ready

Do not stop at creating the visual UI.

Implement the database schema, relationships, API/service layer, reusable components, routes, authentication structure, search system and core functionality.

The final result should feel like a serious modern pharmacology reference + medicine learning platform called MediVault India, with a clean professional interface and a database architecture capable of future expansion.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mediref-genie.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ab863b8-f26e-4f94-b26a-c7510abde5d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
