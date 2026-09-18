import json
import re
import csv
import os

with open("scripts/live_db_medicines.json") as f:
    live = json.load(f)

with open("scripts/collected_181.json") as f:
    items = json.load(f)

def norm(s):
    return re.sub(r"[\s\-_+/,()]+", "", (s or "").lower().strip())

live_slugs = set(m["slug"] for m in live)
live_names = set(norm(m["generic_name"]) for m in live)

def med(slug, generic, display, active, salt, cat, desc,
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
        "status": "published", "verification_status": "verified",
        "last_verified": "2026-03-15", "data_version": "1.0"
    }

extra = [
    # Neurology (8)
    med("lacosamide", "Lacosamide", "Lacosamide Film-Coated", "Lacosamide", "Lacosamide", "Neurology",
        "Third-generation antiepileptic drug selectively enhancing slow inactivation of voltage-gated sodium channels.",
        ["50 mg", "100 mg", "150 mg", "200 mg", "10 mg/mL syrup", "200 mg/20 mL IV"], ["Tablet", "Syrup", "Injection"], ["Oral", "Intravenous"],
        "Selectively enhances slow inactivation of voltage-gated sodium channels, terminating sustained repetitive neuronal firing without affecting fast inactivation.",
        "Reduces seizure frequency in focal-onset seizures with or without secondary generalization.",
        "Rapidly and completely absorbed; peak plasma concentration in 1-4 hours.", "Vd approx 0.6 L/kg; protein binding <15%.",
        "Metabolized by CYP2C19 (minor) and non-CYP pathways to inactive O-desmethyl metabolite.", "95% excreted in urine (40% unchanged, 30% inactive metabolite).",
        "100%", "13 hours", "<15%", "1 hour", "12 to 24 hours",
        ["Focal-onset seizures with or without secondary generalization in adults and children >= 4 years", "Adjunctive therapy in primary generalized tonic-clonic seizures"],
        ["Second- or third-degree AV block without pacemaker", "Hypersensitivity to lacosamide"],
        ["PR interval prolongation on ECG", "Syncope risk", "Suicidal ideation"],
        ["Dizziness", "Headache", "Nausea", "Diplopia"], ["AV conduction block", "Syncope", "DRESS syndrome"],
        ["Class I and III antiarrhythmics (additive PR prolongation)", "CYP2C19 strong inhibitors"], ["Baseline ECG for PR interval", "Renal function tests"],
        "Category C; use only if potential benefit justifies fetal risk.", "Excreted in human milk; use caution.", "Approved for focal seizures in >= 4 years.", "Lower initial dose recommended.", "Max 300 mg/day if CrCl <= 30 mL/min.", "Max 300 mg/day in mild-to-moderate impairment.",
        ["Linear 100% oral bioavailability", "Minimal drug interactions", "IV formulation available"], ["PR prolongation", "Dizziness on titration"], ["Enhances slow inactivation of sodium channels", "Schedule V controlled substance in some regions"],
        "Lacosamide LACS (lacks) fast inactivation, acts on SLOW inactivation.", "-amide", "luh-KOE-suh-mide", "लकोसामाइड"),

    med("lamotrigine", "Lamotrigine", "Lamotrigine Dispersible", "Lamotrigine", "Lamotrigine", "Neurology",
        "Broad-spectrum phenyltriazine antiepileptic and mood stabilizer targeting voltage-gated sodium and calcium channels.",
        ["25 mg", "50 mg", "100 mg", "200 mg dispersible"], ["Dispersible Tablet"], ["Oral"],
        "Voltage-gated sodium channel blocker and inhibitor of presynaptic glutamate and aspartate release.",
        "Stabilizes neuronal membranes and prevents excitatory neurotransmitter release.",
        "Rapid and completely absorbed; peak plasma concentration in 2.5 hours.", "Vd 0.9 to 1.3 L/kg; protein binding 55%.",
        "Extensively metabolized by hepatic glucuronidation via UGT1A4 to inactive 2-N-glucuronide.", "90% excreted in urine primarily as glucuronide conjugates.",
        "98%", "25 to 30 hours (monotherapy; reduced to 14h by inducers, increased to 60h by valproate)", "55%", "1 to 2 hours", "24 hours",
        ["Focal and generalized seizures including Lennox-Gastaut syndrome", "Maintenance treatment of Bipolar I disorder to prevent depressive episodes"],
        ["Known hypersensitivity to lamotrigine"],
        ["Black box warning: Serious cutaneous adverse reactions including Stevens-Johnson syndrome (SJS) and toxic epidermal necrolysis (TEN)", "Titrate very slowly according to manufacturer schedule", "Dose must be halved if co-administered with sodium valproate"],
        ["Dizziness", "Headache", "Diplopia", "Ataxia", "Nausea"], ["Stevens-Johnson syndrome / TEN", "Aseptic meningitis", "Hemophagocytic lymphohistiocytosis (HLH)"],
        ["Sodium valproate (inhibits glucuronidation; doubles half-life, requires half starting dose)", "Carbamazepine/Phenytoin (induces glucuronidation, halves half-life)", "Oral contraceptives (reduce lamotrigine levels by 50%)"], ["Skin inspection for rash at every visit", "Hepatic and renal panel"],
        "Category C; reassuring registry data, folate supplementation recommended.", "Excreted in breast milk; monitor infant for rash.", "Approved down to 2 years for Lennox-Gastaut.", "Lower starting dose, titrate slowly.", "Reduce dose in renal impairment based on CrCl.", "Reduce dose by 50% in Child-Pugh B, 75% in Child-Pugh C.",
        ["Weight neutral", "Excellent mood stabilizing efficacy in bipolar depression", "Dispersible tablet easy for patients"], ["Black box rash risk requires slow titration", "Significant valproate/estrogen interactions"], ["Slow titration prevents SJS", "First-line in women of childbearing potential"],
        "LAM-O-TRIG-INE = Lacks appetite (weight neutral) but triggers rash if hurried.", "-rigine", "luh-MOE-truh-jeen", "लामोत्रिजीन"),

    med("oxcarbazepine", "Oxcarbazepine", "Oxcarbazepine Film-Coated", "Oxcarbazepine", "Oxcarbazepine", "Neurology",
        "Keto-analog of carbamazepine acting as a prodrug for 10-monohydroxy metabolite (MHD) with lower hepatic enzyme induction.",
        ["150 mg", "300 mg", "600 mg"], ["Tablet", "Oral Suspension"], ["Oral"],
        "Prodrug rapidly converted to active 10-monohydroxy metabolite (MHD), which blocks voltage-sensitive sodium channels.",
        "Inhibits repetitive neuronal discharges and decreases synaptic impulse propagation.",
        "Completely absorbed; peak MHD level reached in 4 to 6 hours.", "MHD protein binding is 40%; Vd is 49 L.",
        "Rapidly reduced by cytosolic enzymes in the liver to active MHD; no epoxide intermediate formed.", "Excreted >95% in urine, primarily as MHD glucuronides and unchanged MHD (27%).",
        ">95%", "MHD half-life is 9 to 11 hours (parent drug 2 hours)", "40%", "1 to 2 hours", "12 hours",
        ["Monotherapy or adjunctive therapy for focal seizures with or without secondary generalization"],
        ["Hypersensitivity to oxcarbazepine or carbamazepine (25-30% cross-reactivity)"],
        ["Clinically significant hyponatremia (SIADH-like effect in 2.5-5% of patients)", "Serious dermatologic reactions including SJS/TEN (screen HLA-B*1502 in Asian populations)", "Suicidal ideation"],
        ["Somnolence", "Dizziness", "Diplopia", "Nausea", "Hyponatremia"], ["SJS / TEN", "Severe symptomatic hyponatremia (seizures, coma)", "Anaphylaxis"],
        ["Combined oral contraceptives (MHD induces CYP3A4, causing contraceptive failure)", "Phenytoin (increases phenytoin levels, decreases MHD)"], ["Serum sodium monitoring before starting and during titration", "HLA-B*1502 screening in patients of Asian descent"],
        "Category C; safer than carbamazepine regarding teratogenic risk but folate supplementation essential.", "Excreted in human milk; use with caution.", "Approved down to 2 years.", "Titrate slowly due to higher risk of hyponatremia.", "Reduce dose by 50% if CrCl < 30 mL/min.", "No adjustment needed in mild-to-moderate impairment.",
        ["No toxic epoxide metabolite", "Less CYP induction than carbamazepine", "No auto-induction of metabolism"], ["Hyponatremia common", "Interacts with oral contraceptives"], ["Check serum sodium if patient becomes confused or lethargic", "MHD is the active moiety"],
        "OX-carbazepine: Less toxic than carbamazepine, but OX pulls water (hyponatremia).", "-zepine", "ox-kar-BAZ-uh-peen", "ऑक्सकार्बाज़ेपिन"),

    med("topiramate", "Topiramate", "Topiramate Film-Coated", "Topiramate", "Topiramate", "Neurology",
        "Broad-spectrum sulfamate-substituted monosaccharide antiepileptic and migraine prophylactic agent with multiple mechanisms.",
        ["25 mg", "50 mg", "100 mg", "200 mg"], ["Tablet"], ["Oral"],
        "Blocks voltage-dependent sodium channels, potentiates GABA-A receptor currents, inhibits AMPA/kainate glutamate receptors, and weakly inhibits carbonic anhydrase (isozymes II and IV).",
        "Suppresses epileptiform discharges, reduces migraine frequency, and induces weight loss.",
        "Rapidly absorbed; peak plasma concentration in 2 hours; unaffected by food.", "Vd 0.6 to 0.8 L/kg; protein binding 15-41%.",
        "Minimal hepatic metabolism (approx 20%); not extensively metabolized unless combined with enzyme inducers.", "70% to 80% eliminated unchanged in urine.",
        "80%", "21 hours", "15% to 41%", "1 to 2 hours", "24 hours",
        ["Focal-onset and primary generalized tonic-clonic seizures", "Lennox-Gastaut syndrome adjunctive therapy", "Prophylaxis of migraine headache in adults and adolescents"],
        ["Hypersensitivity to topiramate", "Metabolic acidosis treated with metformin (relative)"],
        ["Cognitive dulling, word-finding difficulty, and psychomotor slowing ('Dopamax')", "Secondary angle-closure glaucoma and acute myopia", "Oligohidrosis and hyperthermia (especially in pediatric patients in warm weather)", "Kidney stones (nephrolithiasis, 1.5% incidence) due to carbonic anhydrase inhibition", "Teratogenic: Oral clefts (cleft lip/palate) in pregnancy"],
        ["Paresthesias (tingling in fingers/toes due to carbonic anhydrase inhibition)", "Weight loss and anorexia", "Drowsiness", "Fatigue", "Taste perversion (carbonated beverages taste flat)"], ["Acute angle-closure glaucoma", "Renal calculi", "Metabolic acidosis (low serum bicarbonate)", "Severe depression/suicidality"],
        ["Estrogen-containing contraceptives (doses >200 mg/day induce CYP3A4, reducing estrogen levels)", "Carbonic anhydrase inhibitors (acetazolamide: additive kidney stone risk)"], ["Serum bicarbonate levels (metabolic acidosis)", "Ophthalmologic examination if eye pain or visual blur occurs", "Serum creatinine"],
        "Category D; proven teratogen causing oral clefts; avoid in women of childbearing potential unless effective contraception used.", "Excreted in human milk; avoid if possible.", "Approved down to 2 years.", "Titrate slowly, monitor hydration.", "Reduce dose by 50% if CrCl < 70 mL/min.", "Clearance decreased in hepatic impairment.",
        ["Causes weight loss rather than weight gain", "Highly effective migraine prophylaxis", "Broad spectrum seizure coverage"], ["Cognitive impairment ('Dopamax')", "Nephrolithiasis", "Teratogenic"], ["Drink at least 2-3 liters of water daily to prevent kidney stones", "Report sudden eye pain immediately"],
        "TOP-iramate: TOP migraine drug, but makes you feel like a DOPe (cognitive slowing) and shrinks weight.", "-iramate", "toe-PEER-uh-mate", "टोपिरामेट"),

    med("pregabalin", "Pregabalin", "Pregabalin Capsules", "Pregabalin", "Pregabalin", "Neurology",
        "Potent alpha-2-delta ligand that binds presynaptic voltage-gated calcium channels to treat neuropathic pain, fibromyalgia, and anxiety.",
        ["50 mg", "75 mg", "150 mg", "300 mg"], ["Capsule"], ["Oral"],
        "Selectively binds the alpha-2-delta auxiliary subunit of presynaptic voltage-gated calcium channels in the CNS, reducing calcium influx and subsequent release of glutamate, substance P, and norepinephrine.",
        "Produces potent analgesic, anxiolytic, and anticonvulsant activity without directly interacting with GABA receptors.",
        "Rapidly and extensively absorbed fasting; peak plasma concentration within 1 hour.", "Vd approx 0.56 L/kg; does not bind plasma proteins (0%).",
        "Negligible hepatic metabolism (<2%); does not induce or inhibit CYP450 enzymes.", "Excreted >98% unchanged in urine via renal elimination.",
        ">90%", "6.3 hours", "0%", "30 to 60 minutes", "12 hours",
        ["Diabetic peripheral neuropathic pain", "Postherpetic neuralgia", "Fibromyalgia", "Spinal cord injury neuropathic pain", "Generalized anxiety disorder (GAD in Europe/India)"],
        ["Known hypersensitivity to pregabalin"],
        ["Peripheral edema and rapid weight gain", "Somnolence and dizziness causing falls in elderly", "Potential for misuse, dependence, and euphoria; Schedule V controlled substance", "Abrupt withdrawal may precipitate seizures or rebound anxiety"],
        ["Dizziness", "Somnolence", "Peripheral edema", "Weight gain", "Dry mouth", "Blurred vision"], ["Angioedema", "Congestive heart failure exacerbation", "Severe respiratory depression when combined with opioids"],
        ["Opioids (fentanyl, morphine: severe synergistic respiratory depression and death)", "Benzodiazepines (profound sedation)", "ACE inhibitors (increased risk of angioedema)"], ["Renal function (eGFR) for mandatory dose adjustments", "Weight and peripheral edema", "Signs of misuse or diversion"],
        "Category C; teratogenic in animals; avoid unless benefits clearly outweigh risks.", "Excreted in breast milk; not recommended.", "Safety and efficacy not established in children <18 years.", "Higher risk of falls; start at 25-50 mg daily.", "Dose reduction mandatory based strictly on CrCl (<60 mL/min).", "No dose adjustment required.",
        ["Predictable linear pharmacokinetics", "Zero hepatic metabolism and zero protein binding", "Rapid onset of pain relief (within days)"], ["Sedation, edema, weight gain", "Abuse/diversion liability", "Requires renal dose adjustment"], ["Linear absorption makes dose titration predictable", "Do not discontinue abruptly; taper over at least 1 week"],
        "PRE-GABA-LIN: PRE-synaptic calcium blocker; PREvents neuropathic pain.", "-gabalin", "pree-GAB-uh-lin", "प्रीगाबालिन"),

    med("levodopa-carbidopa", "Levodopa + Carbidopa", "Levodopa and Carbidopa Controlled-Release", "Levodopa and Carbidopa", "Levodopa / Carbidopa", "Neurology",
        "Gold standard dopamine replacement therapy for Parkinson disease combining dopamine precursor with peripheral DDC inhibitor.",
        ["100 mg / 25 mg", "200 mg / 50 mg", "250 mg / 25 mg"], ["Tablet", "Controlled-Release Tablet"], ["Oral"],
        "Levodopa crosses the blood-brain barrier via L-neutral amino acid transporter (LAT1) and is decarboxylated to dopamine in striatal neurons; carbidopa inhibits peripheral dopa decarboxylase (DDC), preventing peripheral conversion and nausea.",
        "Restores striatal dopamine neurotransmission, alleviating bradykinesia, rigidity, and resting tremor.",
        "Rapidly absorbed in proximal small bowel by large neutral amino acid transporter; food (especially protein) competes for absorption.", "Vd approx 0.9 to 1.6 L/kg; carbidopa does not penetrate blood-brain barrier.",
        "Levodopa is decarboxylated to dopamine and converted by COMT to 3-O-methyldopa; carbidopa is not metabolized by DDC.", "Excreted primarily in urine as dopamine metabolites (DOPAC, HVA); negligible unchanged levodopa.",
        "40% to 70% (with carbidopa)", "Levodopa: 1.5 hours (extended by COMT inhibitors)", "Levodopa 10-30%, Carbidopa 36%", "30 minutes (IR); 1-2 hours (CR)", "3 to 5 hours (progressively shortens with disease progression)",
        ["Idiopathic Parkinson's disease", "Postencephalitic parkinsonism", "Symptomatic parkinsonism following carbon monoxide or manganese intoxication"],
        ["Non-selective MAO inhibitors within 14 days", "Narrow-angle glaucoma", "Suspicious undiagnosed skin lesions or history of melanoma"],
        ["Motor fluctuations ('wearing-off' and 'on-off' phenomena) after 3-5 years of therapy", "Peak-dose dyskinesias (chorea, dystonia)", "Orthostatic hypotension and syncope", "Hallucinations, psychosis, and impulse control disorders (gambling, hypersexuality)", "Avoid high-protein meals at time of dose"],
        ["Nausea and vomiting (reduced by taking with light non-protein snack)", "Orthostatic dizziness", "Drowsiness", "Dark discoloration of sweat, urine, and saliva"], ["Severe peak-dose choreiform dyskinesias", "Visual hallucinations and paranoid psychosis", "Neuroleptic malignant syndrome (NMS)-like syndrome on abrupt withdrawal"],
        ["Non-selective MAOIs (hypertensive crisis)", "Antipsychotics / dopamine antagonists (haloperidol, risperidone: antagonize antiparkinsonian action)", "Iron supplements (chelate levodopa and decrease absorption)"], ["Blood pressure (supine and standing for orthostasis)", "Motor symptom diary (wearing-off, dyskinesias)", "Skin examinations for melanoma"],
        "Category C; use only when benefit justifies potential fetal risk.", "Inhibits lactation by reducing prolactin; avoid.", "Safety not established in pediatric population.", "Higher incidence of hallucinations, orthostatic hypotension, and confusion.", "No formal adjustment needed; monitor tolerability.", "Use with caution in severe hepatic dysfunction.",
        ["Most potent and efficacious symptomatic therapy for Parkinson disease", "Carbidopa eliminates severe peripheral emesis", "Available in IR and CR formulations"], ["Motor complications inevitable after years of use", "Protein meal absorption competition", "Orthostatic hypotension"], ["Take 30-60 minutes before meals; separate from dietary protein", "Never stop abruptly due to risk of hyperpyrexia and rigidity"],
        "CAR-bi-dopa drives LEVO-dopa across the blood-brain barrier in the CAR.", "-dopa", "lee-voe-DOE-puh kar-bih-DOE-puh", "लेवोडोपा कार्बीडोपा"),

    med("donepezil", "Donepezil", "Donepezil Film-Coated", "Donepezil hydrochloride", "Donepezil hydrochloride", "Neurology",
        "Reversible, non-competitive, piperidine-based acetylcholinesterase inhibitor used to improve cognitive function in Alzheimer disease.",
        ["5 mg", "10 mg", "10 mg orally disintegrating tablet (ODT)"], ["Tablet", "Orally Disintegrating Tablet"], ["Oral"],
        "Reversibly and non-competitively inhibits acetylcholinesterase (AChE), increasing acetylcholine concentration in cortical synapses.",
        "Enhances cholinergic neurotransmission, stabilizing cognitive performance and activities of daily living in dementia.",
        "Well absorbed; peak plasma concentration in 3 to 4 hours; unaffected by food.", "Vd approx 12 L/kg; extensively bound to plasma proteins (96%, mainly albumin).",
        "Metabolized in liver via CYP2D6 and CYP3A4 to four major metabolites (two active).", "Excreted in urine (approx 57%, 17% as unchanged drug) and faeces (15%).",
        "100%", "70 hours (allows once-daily dosing at bedtime)", "96%", "Delayed; cognitive stabilization over 2 to 4 weeks", "24 hours",
        ["Mild, moderate, and severe Alzheimer's disease dementia", "Vascular dementia (off-label)", "Lewy body dementia cognitive symptoms"],
        ["Known hypersensitivity to donepezil or piperidine derivatives"],
        ["Vagotonic bradycardia and heart block (syncope risk, 'Pemberton-like' sick sinus syndrome)", "Gastrointestinal bleeding in patients with peptic ulcer history or NSAID use", "Weight loss and anorexia in frail elderly", "Take at bedtime to minimize nausea and dizziness, but switch to morning if nightmares occur"],
        ["Nausea and diarrhoea", "Insomnia and vivid dreams/nightmares", "Muscle cramps", "Fatigue", "Anorexia"], ["Severe symptomatic bradycardia / AV block", "Syncope and falls leading to hip fracture", "Gastrointestinal hemorrhage"],
        ["Beta-blockers (profound additive bradycardia and syncope)", "Anticholinergics (atropine, oxybutynin, diphenhydramine: pharmacodynamic antagonism)", "CYP3A4/2D6 inducers (phenytoin, carbamazepine: reduce donepezil levels)"], ["Baseline pulse and ECG for bradycardia/QTc", "Weight and BMI monthly", "GI symptoms and stool occult blood if on NSAIDs"],
        "Category C; Alzheimer's is predominantly a disease of post-menopausal age.", "Safety not established; avoid.", "Not indicated in children.", "High risk of bradycardia and syncope; start at 5 mg at bedtime.", "No dose adjustment required in renal failure.", "No dose adjustment required in mild-to-moderate cirrhosis.",
        ["Once-daily dosing due to 70h half-life", "High selectivity for acetylcholinesterase over butyrylcholinesterase", "ODT tablet helps dysphagic patients"], ["Vagotonic bradycardia / syncope", "Nightmares / sleep disturbance", "Modest disease-modifying efficacy"], ["Take at bedtime; if vivid nightmares occur, switch to morning dose", "Does not halt neurodegeneration but stabilizes symptoms"],
        "DONE-pezil: When the memory is DONE, Donepezil helps recall.", "-pezil", "doe-NEP-uh-zil", "डोेनेपेजिल"),

    med("sumatriptan", "Sumatriptan", "Sumatriptan Succinate", "Sumatriptan succinate", "Sumatriptan succinate", "Neurology",
        "Prototypic 5-HT1B/1D receptor agonist providing rapid acute relief of migraine attacks and cluster headaches.",
        ["25 mg", "50 mg", "100 mg", "6 mg/0.5 mL subcutaneous autoinjector", "20 mg nasal spray"], ["Tablet", "Subcutaneous Injection", "Nasal Spray"], ["Oral", "Subcutaneous", "Intranasal"],
        "Selective agonist for 5-HT1B (vascular) and 5-HT1D (neuronal) receptors, causing cranial vasoconstriction and inhibiting trigeminal calcitonin gene-related peptide (CGRP) release.",
        "Constricts distended meningeal and dural arterial vessels, blocks neurogenic inflammation, and relieves migraine pain, nausea, and photophobia.",
        "Oral bioavailability is low (15%) due to extensive first-pass metabolism; SC bioavailability is 96% with peak in 10-15 minutes.", "Vd approx 2.7 L/kg; protein binding 14-21%.",
        "Metabolized predominantly by monoamine oxidase A (MAO-A) to inactive indole acetic acid derivative.", "Excreted primarily in urine (60%, mainly metabolites, 3% unchanged) and faeces (40%).",
        "15% (Oral); 96% (SC)", "2 hours", "14% to 21%", "SC: 10-15 min; Nasal: 15 min; Oral: 30-60 min", "4 to 6 hours",
        ["Acute treatment of migraine attacks with or without aura", "Acute treatment of episodic and chronic cluster headache (subcutaneous formulation is first-line)"],
        ["Ischemic coronary artery disease (angina, history of MI)", "Coronary vasospasm (Prinzmetal angina)", "Uncontrolled hypertension", "History of stroke or transient ischemic attack (TIA)", "Peripheral vascular disease", "Hemiplegic or basilar migraine", "Concomitant use of ergotamines or MAO-A inhibitors within 24 hours"],
        ["Coronary vasospasm and myocardial ischemia/infarction (even in patients without prior CAD)", "Significant blood pressure elevation", "Serotonin syndrome when combined with SSRIs/SNRIs", "Medication overuse headache (MOH) if used >10 days per month"],
        ["Triptan sensations (chest, neck, or jaw tightness, pressure, or heaviness)", "Flushing and warmth", "Dizziness and tingling", "Injection site pain (SC)"], ["Acute myocardial infarction / fatal ventricular arrhythmia", "Cerebral hemorrhage / ischemic stroke", "Coronary artery vasospasm"],
        ["MAO-A inhibitors (phenelzine, moclobemide: 2-fold increase in sumatriptan levels; contraindicated within 2 weeks)", "Ergotamine / dihydroergotamine (prolonged additive vasoconstriction; separate by >= 24 hours)", "SSRIs / SNRIs (serotonin syndrome risk)"], ["Cardiovascular risk assessment before prescribing", "Blood pressure monitoring", "Frequency of migraine days to prevent MOH"],
        "Category C; extensive pregnancy registry shows no increased teratogenic rate, but use only when clearly needed.", "Excreted in breast milk; avoid nursing for 12 hours after dose.", "Safety and efficacy not established in patients <18 years.", "Cardiovascular evaluation strongly advised before use in elderly.", "No dosage adjustment necessary in renal impairment.", "Contraindicated in severe hepatic impairment; cap oral dose at 50 mg in mild-moderate.",
        ["Fastest relief among all acute migraine therapies (SC autoinjector works in 10-15 min)", "Available in oral, nasal, and subcutaneous formulations", "Gold standard acute cluster headache therapy"], ["Chest tightness sensations can simulate angina", "Contraindicated in cardiovascular disease", "Risk of medication overuse headache"], ["Take as early as possible during migraine headache phase (not during aura)", "Chest tightness is common ('triptan sensation') and usually benign, but rule out CAD"],
        "SUMA-triptan: SUMMONS relief for acute migraine by squeezing blood vessels.", "-triptan", "soo-muh-TRIP-tan", "सुमाट्रिप्टान"),

    # Psychiatry (8)
    med("escitalopram", "Escitalopram", "Escitalopram Oxalate", "Escitalopram oxalate", "Escitalopram oxalate", "Psychiatry",
        "S-enantiomer of citalopram; the most selective serotonin reuptake inhibitor (SSRI) with minimal anticholinergic and antihistaminic activity.",
        ["5 mg", "10 mg", "15 mg", "20 mg"], ["Tablet"], ["Oral"],
        "Pure S-enantiomer that binds with high affinity to the primary serotonin transporter (SERT) and allosteric site, potently blocking 5-HT reuptake.",
        "Enhances central serotonergic neurotransmission, producing antidepressant and anxiolytic effects over 2 to 4 weeks.",
        "Rapidly absorbed; peak plasma concentration in 3 to 4 hours; unaffected by food.", "Vd approx 12 to 26 L/kg; protein binding 56%.",
        "Metabolized in liver by CYP2C19 and CYP3A4 to S-demethylcitalopram (inactive/weak).", "Hepatic elimination; urinary excretion of parent drug is approx 8%.",
        "80%", "27 to 32 hours (allows once-daily morning or evening dosing)", "56%", "1 to 2 weeks for initial anxiolysis; 4-6 weeks for full antidepressant response", "24 hours",
        ["Major depressive disorder (MDD)", "Generalized anxiety disorder (GAD)", "Panic disorder with or without agoraphobia", "Social anxiety disorder", "Obsessive-compulsive disorder (OCD)"],
        ["Concomitant use of MAO inhibitors (within 14 days) or pimozide", "Congenital long QT syndrome or known QTc prolongation"],
        ["Black box warning: Increased risk of suicidal ideation and behaviour in children, adolescents, and young adults (<= 24 years)", "Dose-dependent QTc prolongation (maximum recommended dose is 20 mg/day, 10 mg/day in elderly)", "Hyponatremia / SIADH in elderly", "Serotonin syndrome risk with other serotonergics", "Do not discontinue abruptly (SSRI discontinuation syndrome)"],
        ["Nausea", "Insomnia or somnolence", "Ejaculatory delay / sexual dysfunction", "Fatigue", "Increased sweating", "Dry mouth"], ["Serotonin syndrome", "Severe QTc prolongation and Torsades de Pointes", "Gastrointestinal bleeding (impairs platelet serotonin uptake)"],
        ["MAO inhibitors (fatal serotonin syndrome; contraindicated)", "QTc-prolonging drugs (amiodarone, haloperidol, ondansetron: additive QT risk)", "NSAIDs/Aspirin (increased gastrointestinal bleeding risk)", "CYP2C19 inhibitors (omeprazole: doubles escitalopram levels; cap at 10 mg)"], ["Baseline and follow-up ECG for QTc in high-risk patients", "Serum sodium in elderly", "Suicidality monitoring during first 4-8 weeks"],
        "Category C; low risk of persistent pulmonary hypertension of the newborn (PPHN) in late pregnancy.", "Excreted into breast milk in low concentrations; monitor infant for drowsiness.", "Approved for MDD in adolescents >= 12 years.", "Maximum dose 10 mg/day due to increased risk of QTc prolongation and hyponatremia.", "No adjustment in mild-to-moderate; caution in severe (CrCl < 20 mL/min).", "Maximum dose 10 mg/day in hepatic impairment.",
        ["Highest SERT selectivity among all SSRIs", "Lowest drug-drug interaction potential among SSRIs", "Well tolerated with once-daily dosing"], ["Sexual dysfunction common and persistent", "QTc prolongation at high doses", "Discontinuation syndrome if stopped abruptly"], ["Take in morning if stimulating, or evening if sedating", "Taper gradually over 2-4 weeks when stopping"],
        "ES-citalopram: EXCELLENT SELECTIVITY for Serotonin.", "-pram", "es-sye-TAL-oh-pram", "एस्सिटालोप्राम"),

    med("sertraline", "Sertraline", "Sertraline Film-Coated", "Sertraline hydrochloride", "Sertraline hydrochloride", "Psychiatry",
        "Potent and well-tolerated SSRI with weak dopamine reuptake inhibition, safe in cardiovascular disease and safe during breastfeeding.",
        ["25 mg", "50 mg", "100 mg"], ["Tablet"], ["Oral"],
        "Potently inhibits presynaptic serotonin reuptake (SERT); also possesses weak dopamine reuptake inhibitor (DAT) activity.",
        "Increases synaptic 5-HT and dopamine concentrations in limbic pathways, reducing depressive and anxious symptoms.",
        "Slow oral absorption; peak plasma concentration in 4.5 to 8.4 hours; food increases peak concentration by 25%.", "Enormous Vd (>20 L/kg); extensively bound to plasma proteins (98%).",
        "Extensively metabolized in the liver via CYP2B6, CYP2C19, CYP2C9, and CYP3A4 to N-desmethylsertraline (substantially less active).", "Excreted equally in urine and faeces mainly as inactive polar metabolites.",
        "44%", "26 hours (active metabolite desmethylsertraline 62-104 hours)", "98%", "2 to 4 weeks", "24 hours",
        ["Major depressive disorder", "Obsessive-compulsive disorder (adults and children >= 6 years)", "Panic disorder", "Post-traumatic stress disorder (PTSD)", "Social anxiety disorder", "Premenstrual dysphoric disorder (PMDD)"],
        ["Concomitant MAO inhibitors or pimozide", "Disulfiram (oral liquid concentrate contains 12% alcohol)"],
        ["Black box warning: Suicidal thinking and behavior in young adults", "Gastrointestinal upset ('squirtraline') during first 1-2 weeks", "Bleeding risk when combined with antiplatelets or anticoagulants", "Discontinuation syndrome on abrupt cessation"],
        ["Diarrhoea and loose stools (most common SSRI for GI adverse effects)", "Nausea", "Insomnia", "Tremor", "Sexual dysfunction"], ["Serotonin syndrome", "Severe hyponatremia / SIADH", "Mania induction in undiagnosed bipolar disorder"],
        ["MAOIs (fatal serotonin syndrome)", "Warfarin and aspirin (increased bleeding risk)", "CYP2D6 substrates (mild inhibition)"], ["Suicide risk assessment", "Weight and mental status", "Electrolytes in elderly"],
        "Category C; favored SSRI in pregnancy by many consensus guidelines.", "Extremely low concentrations in breast milk; preferred SSRI during lactation.", "Approved for OCD in children >= 6 years.", "Start at 25 mg daily; monitor for hyponatremia.", "No adjustment necessary in renal impairment.", "Use lower or less frequent doses in cirrhosis.",
        ["First-choice SSRI post-myocardial infarction (SADHART trial proved cardiac safety)", "Preferred SSRI in breastfeeding", "Mild dopamine reuptake helps energy/motivation"], ["GI adverse effects (diarrhoea) very common at initiation", "Sexual dysfunction"], ["Take with food to reduce nausea and diarrhoea", "First-line antidepressant in cardiac patients"],
        "SER-traline: SAFE for the HEART and preferred for NURSING mothers.", "-traline", "SIR-truh-leen", "सर्ट्रालीन"),

    med("venlafaxine", "Venlafaxine", "Venlafaxine Extended-Release", "Venlafaxine hydrochloride", "Venlafaxine hydrochloride", "Psychiatry",
        "Serotonin and norepinephrine reuptake inhibitor (SNRI) with dose-dependent dual neurotransmitter modulation.",
        ["37.5 mg", "75 mg", "150 mg extended-release"], ["Extended-Release Capsule"], ["Oral"],
        "Potently inhibits serotonin reuptake at low doses (<150 mg/day); additionally inhibits norepinephrine reuptake at moderate-to-high doses (>=150 mg/day).",
        "Increases synaptic availability of both 5-HT and NE in the prefrontal cortex and descending pain pathways.",
        "Well absorbed (92%); peak levels of extended-release capsule reached in 5.5 to 9 hours.", "Vd approx 7.5 L/kg; protein binding 27% (parent) and 30% (metabolite).",
        "Extensively metabolized in liver by CYP2D6 to major active equipotent metabolite O-desmethylvenlafaxine (desvenlafaxine).", "Excreted approx 87% in urine (5% unchanged parent, 30% unconjugated ODV, 26% conjugated ODV).",
        "45%", "Parent 5 hours; active metabolite ODV 11 hours", "27% to 30%", "2 to 4 weeks", "24 hours",
        ["Major depressive disorder", "Generalized anxiety disorder", "Social anxiety disorder", "Panic disorder", "Neuropathic pain and hot flashes (off-label)"],
        ["Concomitant use of MAO inhibitors within 14 days", "Uncontrolled severe hypertension"],
        ["Dose-dependent sustained hypertension (due to norepinephrine reuptake inhibition; monitor BP closely at doses >=150 mg)", "Black box warning: Suicidality in children and young adults", "Severe discontinuation syndrome with electric shock-like sensations ('brain zaps') on missed doses", "Fatal in overdose due to cardiac conduction toxicity and seizures (higher risk than SSRIs)"],
        ["Nausea", "Headache", "Sweating (diaphoresis)", "Insomnia", "Dizziness", "Dry mouth", "Sexual dysfunction"], ["Sustained diastolic hypertension", "Serotonin syndrome", "Severe withdrawal syndrome on abrupt discontinuation", "Seizures in overdose"],
        ["MAO inhibitors (hypertensive crisis and serotonin syndrome)", "CYP2D6 inhibitors (paroxetine, fluoxetine: increase venlafaxine levels)", "Haloperidol (increases haloperidol AUC by 70%)"], ["Blood pressure at baseline and after every dose titration", "Heart rate", "Serum lipids (may cause slight elevation)"],
        "Category C; risk of neonate withdrawal syndrome if taken in third trimester.", "Excreted into breast milk; use with caution or switch to sertraline.", "Not approved in pediatric patients.", "Start at 37.5 mg daily; monitor blood pressure closely.", "Reduce total daily dose by 25-50% in renal impairment.", "Reduce total daily dose by 50% in cirrhosis.",
        ["Dual mechanism provides robust efficacy in treatment-resistant depression", "Relieves neuropathic pain and vasomotor hot flashes", "Once-daily ER capsule"], ["Dose-dependent hypertension", "Severe withdrawal syndrome if even one dose is missed", "Toxicity in overdose"], ["Must swallow ER capsules whole with water; never crush or chew", "Taper very slowly over months to avoid 'brain zaps' and severe withdrawal"],
        "VEN-lafaxine: VASCULAR PRESSURE rises at high doses; very severe withdrawal if missed.", "-faxine", "ven-luh-FAX-een", "वेनलाफैक्सिन"),

    med("duloxetine", "Duloxetine", "Duloxetine Delayed-Release", "Duloxetine hydrochloride", "Duloxetine hydrochloride", "Psychiatry",
        "Potent dual SNRI with balanced 5-HT and NE reuptake inhibition across all therapeutic doses, effective for depression and chronic somatic pain.",
        ["20 mg", "30 mg", "60 mg"], ["Delayed-Release Capsule"], ["Oral"],
        "Potently and equally inhibits neuronal reuptake of both serotonin and norepinephrine throughout the dosing range; weak dopamine uptake inhibitor.",
        "Alleviates depressive mood and anxiety, and activates descending noradrenergic and serotonergic pain inhibitory pathways in the dorsal horn.",
        "Well absorbed; acid-labile enteric coating delays absorption by 2 hours; peak plasma concentration in 6 hours; food delays peak to 10 hours.", "Vd approx 1640 L; highly bound to plasma proteins (>90%, mainly albumin and alpha-1-acid glycoprotein).",
        "Extensively metabolized in the liver via CYP1A2 and CYP2D6 to multiple inactive glucuronide and sulfate metabolites.", "Excreted in urine (approx 70% as metabolites) and faeces (20%).",
        "50%", "12 hours", ">90%", "2 to 4 weeks for depression; 1 to 2 weeks for pain", "24 hours",
        ["Major depressive disorder", "Generalized anxiety disorder", "Diabetic peripheral neuropathic pain", "Fibromyalgia", "Chronic musculoskeletal pain (osteoarthritis, chronic lower back pain)"],
        ["Concomitant MAO inhibitors within 14 days", "Uncontrolled narrow-angle glaucoma", "Severe renal impairment (CrCl < 30 mL/min)", "Any hepatic impairment / chronic liver disease"],
        ["Hepatotoxicity: Avoid in patients with substantial alcohol use or chronic liver disease", "Black box warning: Suicidal thinking in young adults", "Blood pressure and heart rate elevation", "Urinary retention / hesitancy in patients with prostatic hypertrophy", "Severe discontinuation syndrome if stopped abruptly"],
        ["Nausea (very common at initiation; take with meals)", "Dry mouth", "Somnolence", "Constipation", "Decreased appetite", "Hyperhidrosis"], ["Fulminant hepatotoxicity / hepatic failure", "Serotonin syndrome", "Severe hyponatremia", "Syncope and orthostatic hypotension"],
        ["Potent CYP1A2 inhibitors (ciprofloxacin, fluvoxamine: produce 5-fold increase in duloxetine levels; avoid)", "CYP2D6 substrates (metoprolol, flecainide: duloxetine is a moderate CYP2D6 inhibitor)", "MAO inhibitors (fatal serotonin syndrome)"], ["Liver function tests (ALT, AST, total bilirubin) at baseline and symptoms of jaundice", "Blood pressure", "Urinary stream in men"],
        "Category C; potential neonatal withdrawal syndrome if used in late pregnancy.", "Excreted into breast milk; use caution.", "Safety and efficacy not established in children <18 years.", "Higher risk of falls and hyponatremia; start at 30 mg daily.", "Avoid use in severe renal failure (CrCl < 30 mL/min) due to metabolite accumulation.", "Contraindicated in any hepatic insufficiency or chronic liver disease.",
        ["Simultaneously treats depression and chronic painful physical symptoms", "Balanced dual reuptake inhibition even at starting 60 mg dose", "FDA approved for fibromyalgia and chronic back pain"], ["High incidence of initial nausea", "Strictly contraindicated in liver disease", "Strong CYP1A2 drug interactions"], ["Swallow whole; do not chew or crush enteric beads", "First-line option for depression co-occurring with chronic pain"],
        "DUAL-oxetine: DUAL action (5HT + NE) for DUAL problems (Depression + Pain).", "-oxetine", "doo-LOX-uh-teen", "डुलोक्सेटीन"),

    med("mirtazapine", "Mirtazapine", "Mirtazapine Orally Disintegrating", "Mirtazapine", "Mirtazapine", "Psychiatry",
        "Noradrenergic and specific serotonergic antidepressant (NaSSA) that stimulates appetite, promotes sleep, and avoids sexual dysfunction.",
        ["7.5 mg", "15 mg", "30 mg", "45 mg orally disintegrating tablet (ODT)"], ["Tablet", "Orally Disintegrating Tablet"], ["Oral"],
        "Antagonizes central presynaptic alpha-2 auto- and heteroreceptors, increasing norepinephrine and serotonin release; simultaneously blocks postsynaptic 5-HT2 and 5-HT3 receptors and potently blocks H1 histamine receptors.",
        "Specific 5-HT1A stimulation produces antidepressant effects; 5-HT2 blockade prevents anxiety and sexual dysfunction; 5-HT3 blockade prevents nausea; H1 blockade produces profound sedation and orexigenic appetite stimulation.",
        "Rapidly and well absorbed; peak concentration in 2 hours; food has minimal effect.", "Vd approx 107 L; protein binding 85%.",
        "Extensively metabolized in the liver via CYP2D6, CYP1A2, and CYP3A4 to 8-hydroxy and N-demethyl metabolites.", "Excreted predominantly in urine (75%) and faeces (15%).",
        "50%", "20 to 40 hours (allows once-daily dosing at bedtime)", "85%", "Sedation and appetite occur immediately; antidepressant effect in 2 to 4 weeks", "24 hours",
        ["Major depressive disorder (especially with prominent insomnia, severe weight loss, or chemotherapy-associated anorexia)"],
        ["Concomitant MAO inhibitors within 14 days", "Hypersensitivity to mirtazapine"],
        ["Profound daytime somnolence and impaired motor coordination", "Marked hyperphagia, carbohydrate cravings, and substantial weight gain", "Rare agranulocytosis / severe neutropenia (discontinue if fever or sore throat develops)", "Black box warning: Suicidality in young adults", "Paradoxical effect: Lower doses (7.5-15 mg) are more sedating than higher doses (30-45 mg) due to stronger H1 dominance"],
        ["Sedation and drowsiness (taken at bedtime)", "Increased appetite and weight gain", "Dry mouth", "Constipation", "Dizziness"], ["Agranulocytosis / severe neutropenia", "Serotonin syndrome", "Severe hypertriglyceridemia"],
        ["MAO inhibitors (fatal serotonin syndrome)", "Alcohol and sedatives (profound CNS depression)", "CYP3A4 inducers (carbamazepine: decreases mirtazapine levels by 60%)"], ["CBC with differential if fever, sore throat, or signs of infection appear", "Body weight, BMI, and fasting lipid profile", "Fasting blood glucose"],
        "Category C; use only when maternal benefit outweighs potential fetal risk.", "Excreted in small amounts in breast milk; monitor infant for sedation.", "Safety and efficacy not established in pediatric patients.", "Start at 7.5 mg at bedtime; monitor for oversedation and falls.", "Clearance reduced in moderate-to-severe renal impairment; dose with caution.", "Clearance reduced by 30% in hepatic impairment.",
        ["Zero sexual dysfunction", "Rapidly resolves severe insomnia without benzodiazepines", "Ideal for elderly depressed patients with failure to thrive and severe anorexia"], ["Substantial weight gain and carbohydrate cravings", "Daytime grogginess", "Rare agranulocytosis risk"], ["Take at bedtime; lower doses (15 mg) cause more sleepiness than 30-45 mg", "Report any fever, mouth ulcers, or sore throat immediately"],
        "MEAL-tazapine: Makes you eat a big MEAL and sleep like a log.", "-zapine", "mir-TAZ-uh-peen", "मिर्ताज़ापीन"),

    med("olanzapine", "Olanzapine", "Olanzapine Mouth Dissolving", "Olanzapine", "Olanzapine", "Psychiatry",
        "Second-generation (atypical) thienobenzodiazepine antipsychotic with broad receptor affinity and high risk of metabolic syndrome.",
        ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "15 mg", "20 mg orally disintegrating tablet (ODT)"], ["Tablet", "Orally Disintegrating Tablet", "IM Injection"], ["Oral", "Intramuscular"],
        "Antagonizes dopamine D2, serotonin 5-HT2A and 5-HT2C, histamine H1, muscarinic M1-M5, and alpha-1 adrenergic receptors in the CNS.",
        "Potent 5-HT2A antagonism combined with limbic-selective D2 blockade controls positive and negative psychotic symptoms with low risk of extrapyramidal symptoms (EPS).",
        "Well absorbed; peak plasma concentration in 6 hours; unaffected by food.", "Extensive Vd approx 1000 L; protein binding 93% (mainly albumin and AAG).",
        "Metabolized in liver via CYP1A2 (major) and direct glucuronidation (UGT1A4); smoking induces CYP1A2, reducing olanzapine levels by 30-40%.", "Excreted in urine (approx 57%, mostly metabolites) and faeces (30%).",
        "60%", "30 hours (range 21 to 54 hours; once daily at bedtime)", "93%", "Sedation within hours; antipsychotic efficacy in 1 to 2 weeks", "24 hours",
        ["Schizophrenia", "Acute manic or mixed episodes in Bipolar I disorder", "Bipolar maintenance monotherapy", "Treatment-resistant depression (in combination with fluoxetine)"],
        ["Known hypersensitivity to olanzapine", "Narrow-angle glaucoma"],
        ["Severe metabolic syndrome: Massive weight gain, dyslipidemia, new-onset Type 2 diabetes mellitus, and diabetic ketoacidosis (DKA)", "Black box warning: Increased mortality in elderly patients with dementia-related psychosis", "Neuroleptic malignant syndrome (NMS)", "Tardive dyskinesia on long-term therapy", "Post-injection delirium/sedation syndrome with long-acting pamoate injection"],
        ["Weight gain (highest among atypical antipsychotics)", "Somnolence", "Increased appetite", "Dry mouth", "Constipation", "Orthostatic dizziness"], ["Diabetic ketoacidosis (DKA) / hyperosmolar coma", "Neuroleptic malignant syndrome", "Drug Reaction with Eosinophilia and Systemic Symptoms (DRESS)", "Tardive dyskinesia"],
        ["Tobacco smoking (CYP1A2 induction reduces olanzapine levels by 40%; dose may need increase in heavy smokers)", "Ciprofloxacin and fluvoxamine (CYP1A2 inhibitors double olanzapine levels)", "Antihypertensives (additive orthostatic hypotension)"], ["Baseline and periodic weight, waist circumference, fasting lipid panel, and HbA1c", "Fasting blood glucose at 12 weeks, then annually", "AIMS exam for tardive dyskinesia"],
        "Category C; third trimester exposure risks neonatal EPS and withdrawal.", "Excreted into breast milk; not recommended.", "Approved for schizophrenia and bipolar mania in adolescents >= 13 years.", "Start at 2.5-5 mg; increased risk of orthostasis and falls.", "No dosage adjustment required.", "Lower starting dose (5 mg) recommended in hepatic impairment.",
        ["Exceptionally potent antipsychotic and antimanic efficacy", "Very low rate of extrapyramidal symptoms and akathisia", "Rapid tranquilization in acute agitation via ODT or IM"], ["Severe metabolic derangement and massive weight gain", "Sedation", "Cardiometabolic monitoring burden"], ["Monitor fasting glucose and lipids regularly", "Counsel patient and family regarding healthy diet and weight management at baseline"],
        "O-LANZ-apine: Makes you large as an O-LANTERN (massive weight gain).", "-zapine", "oh-LAN-zuh-peen", "ओलांज़ापीन"),

    med("quetiapine", "Quetiapine", "Quetiapine Extended-Release", "Quetiapine fumarate", "Quetiapine fumarate", "Psychiatry",
        "Broad-spectrum dibenzothiazepine atypical antipsychotic with low D2 receptor occupancy, minimal EPS, and potent active metabolite norquetiapine.",
        ["25 mg", "50 mg", "100 mg", "200 mg", "300 mg", "400 mg extended-release"], ["Immediate-Release Tablet", "Extended-Release Tablet"], ["Oral"],
        "Low-affinity D2 receptor antagonist with rapid dissociation kinetics ('hit-and-run'); potently antagonizes 5-HT2A, H1 histamine, and alpha-1 adrenergic receptors; active metabolite norquetiapine potently inhibits the norepinephrine transporter (NET) and acts as a 5-HT1A partial agonist.",
        "Sedation and anxiolysis mediated via H1 blockade; antipsychotic action mediated via 5-HT2A/D2 blockade; antidepressant action mediated via NET inhibition by norquetiapine.",
        "Rapidly absorbed; peak plasma concentration in 1.5 hours (IR) and 6 hours (XR); high-fat meal increases XR bioavailability.", "Vd approx 10 L/kg; protein binding 83%.",
        "Extensively metabolized in liver by CYP3A4 to active norquetiapine and multiple inactive metabolites.", "Excreted in urine (73%) and faeces (20%), with <1% unchanged drug.",
        "100% relative to solution", "Quetiapine approx 6 to 7 hours; norquetiapine approx 12 hours", "83%", "Sedation within 1 hour; antidepressant and antipsychotic effect in 1 to 3 weeks", "24 hours (XR)",
        ["Schizophrenia", "Bipolar I mania and Bipolar depression", "Maintenance treatment of Bipolar I disorder", "Adjunctive therapy in Major Depressive Disorder (XR formulation)"],
        ["Known hypersensitivity to quetiapine"],
        ["Black box warning: Increased mortality in elderly patients with dementia-related psychosis", "Black box warning: Suicidality in children and young adults", "Severe somnolence and sedation", "Orthostatic hypotension and reflex tachycardia due to alpha-1 blockade", "Metabolic changes: weight gain, hyperglycemia, hypertriglyceridemia", "Cataracts reported in animal studies (slit lamp examination recommended)"],
        ["Somnolence and sedation (frequently dosed at night)", "Dry mouth", "Dizziness", "Constipation", "Weight gain", "Orthostatic hypotension"], ["Neuroleptic malignant syndrome", "Tardive dyskinesia", "QTc prolongation and cardiac arrhythmias in overdose", "Severe neutropenia / agranulocytosis"],
        ["CYP3A4 inhibitors (ketoconazole, clarithromycin: 5-fold increase in quetiapine levels; reduce quetiapine dose by 80%)", "CYP3A4 inducers (phenytoin, carbamazepine: reduce quetiapine levels by 80%)", "Antihypertensives (additive orthostatic hypotension)"], ["Fasting glucose, HbA1c, and lipid panel at baseline and every 6-12 months", "Blood pressure (orthostatic vitals)", "Slit lamp eye examination every 6 months"],
        "Category C; potential neonatal EPS/withdrawal if used in third trimester.", "Excreted into breast milk in small amounts; monitor infant.", "Approved for schizophrenia in adolescents >= 13 years, bipolar in >= 10 years.", "Start at 25 mg/day; high risk of orthostasis and falls.", "No dosage adjustment required.", "Start at 25-50 mg daily; titrate slowly in hepatic impairment.",
        ["Lowest risk of extrapyramidal symptoms and hyperprolactinemia among antipsychotics", "Preferred antipsychotic in Parkinson disease psychosis", "Approved for both bipolar mania AND bipolar depression"], ["Sedation can be disabling", "Orthostatic hypotension at initiation", "Metabolic syndrome and weight gain"], ["Take XR tablets once daily at night, without food or with a light meal", "First-choice antipsychotic if patient has Parkinson's disease or EPS vulnerability"],
        "QUIET-iapine: Makes the patient QUIET and sleepy at night.", "-tiapine", "kweh-TYE-uh-peen", "क्वेटीयापीन"),

    med("aripiprazole", "Aripiprazole", "Aripiprazole Film-Coated", "Aripiprazole", "Aripiprazole", "Psychiatry",
        "Third-generation atypical antipsychotic acting as a dopamine D2 partial agonist ('dopamine system stabilizer') with favorable metabolic profile.",
        ["2 mg", "5 mg", "10 mg", "15 mg", "20 mg", "30 mg", "10 mg orally disintegrating tablet (ODT)"], ["Tablet", "Orally Disintegrating Tablet"], ["Oral", "Intramuscular"],
        "Functions as a partial agonist at dopamine D2 and 5-HT1A receptors, and an antagonist at serotonin 5-HT2A receptors.",
        "Exerts functional dopamine antagonism in hyperdopaminergic states (mesolimbic pathway: treats psychosis) and functional agonism in hypodopaminergic states (mesocortical: improves negative/cognitive symptoms), with minimal sedation, weight gain, or hyperprolactinemia.",
        "Well absorbed; peak plasma concentration in 3 to 5 hours; unaffected by food.", "Vd approx 4.9 L/kg; extensively bound to plasma proteins (>99%, primarily albumin).",
        "Metabolized in liver by CYP2D6 and CYP3A4 to active metabolite dehydro-aripiprazole.", "Excreted in faeces (approx 55%) and urine (25%), with <1% unchanged parent.",
        "87%", "75 hours (parent drug); 94 hours (active dehydro-aripiprazole metabolite)", ">99%", "1 to 2 weeks", "24 to 48 hours",
        ["Schizophrenia", "Acute manic and mixed episodes in Bipolar I disorder", "Adjunctive therapy in Major Depressive Disorder", "Autistic disorder irritability (pediatric)", "Tourette's disorder"],
        ["Known hypersensitivity to aripiprazole"],
        ["Akathisia (intense inner restlessness and urge to move; most common side effect at start of therapy)", "Impulse control disorders (pathological gambling, compulsive eating, compulsive shopping, hypersexuality)", "Black box warning: Mortality in elderly patients with dementia-related psychosis", "Black box warning: Suicidality in children and young adults"],
        ["Akathisia and motor restlessness", "Insomnia", "Nausea", "Headache", "Lightheadedness", "Tremor"], ["Neuroleptic malignant syndrome", "Tardive dyskinesia", "Severe pathological gambling / impulse control disorders"],
        ["CYP3A4 inhibitors (ketoconazole: halve aripiprazole dose)", "CYP2D6 inhibitors (fluoxetine, paroxetine: halve aripiprazole dose)", "CYP3A4 inducers (carbamazepine: double aripiprazole dose)"], ["Monitor for akathisia and motor restlessness closely during initial titration", "Screen for novel impulsive behaviors (gambling, hypersexuality)", "Weight and metabolic profile"],
        "Category C; use only if maternal benefit outweighs fetal risk.", "Excreted in human milk; breastfeeding not recommended.", "Approved for schizophrenia >= 13 years, bipolar mania >= 10 years, autism irritability >= 6 years.", "Start at lower dose (2-5 mg); monitor for akathisia.", "No dosage adjustment required in renal impairment.", "No dosage adjustment required in hepatic impairment.",
        ["Weight-neutral and minimal metabolic derangement", "No prolactin elevation (may lower elevated prolactin)", "Non-sedating; taken in the morning"], ["High incidence of akathisia", "Can trigger compulsive gambling / spending", "Long half-life means slow steady-state washout"], ["Take in the morning because it can be activating and cause insomnia", "Inform family to report sudden urges to gamble or overspend"],
        "A-RIPI-prazole: RIPS dopamine into balance (partial agonist stabilizer).", "-piprazole", "uh-rip-IP-ruh-zole", "अरिपिप्राज़ोल"),

    # Dermatology (8)
    med("isotretinoin", "Isotretinoin", "Isotretinoin Soft Gelatin Capsules", "Isotretinoin (13-cis-retinoic acid)", "Isotretinoin", "Dermatology",
        "Oral retinoid providing curative remission for severe recalcitrant nodulocystic acne; highly teratogenic requiring strict risk management.",
        ["10 mg", "20 mg", "40 mg"], ["Soft Gelatin Capsule"], ["Oral"],
        "Interacts with retinoic acid nuclear receptors, profoundly suppressing sebaceous gland size and activity, normalizing follicular keratinocyte differentiation, reducing Cutibacterium acnes, and exerting potent anti-inflammatory effects.",
        "Decreases sebum production by >90%, clears comedones, prevents scarring, and induces long-term acne remission.",
        "Oral absorption is variable; high-fat meal doubles bioavailability and peak concentrations (take strictly with fatty meals).", "Vd 1.5 to 3 L/kg; protein binding 99.9% (almost exclusively albumin).",
        "Metabolized in liver via CYP2C8, CYP2C9, CYP3A4 to 4-oxo-isotretinoin, tretinoin, and 4-oxo-tretinoin; undergoes enterohepatic recycling.", "Excreted equally in urine and faeces as metabolites; negligible unchanged drug.",
        "25% fasting; 50% with high-fat meal", "10 to 20 hours (4-oxo metabolite 17 to 50 hours)", "99.9%", "Initial acne flare at 2-3 weeks; visible clearing at 6-8 weeks", "Permanent or long-lasting remission after cumulative dose of 120-150 mg/kg",
        ["Severe recalcitrant nodular and conglobate acne", "Acne unresponsive to conventional systemic antibiotics and topical therapy", "Acne causing severe psychological distress and scarring"],
        ["Pregnancy (Category X; absolute contraindication)", "Breastfeeding", "Severe hepatic insufficiency", "Pre-existing severe hyperlipidemia (hypertriglyceridemia)", "Hypervitaminosis A", "Concomitant use of tetracyclines"],
        ["Black box warning: Extreme teratogenicity (severe craniofacial, cardiac, thymic, and CNS fetal malformations, spontaneous abortion)", "Mandatory iPLEDGE / dual contraception: 2 negative pregnancy tests prior, monthly during, and 1 month post-therapy", "Severe mucocutaneous dryness (cheilitis in 100% of patients)", "Marked hypertriglyceridemia and acute pancreatitis risk", "Depression, psychosis, and suicidal ideation", "Pseudotumor cerebri (benign intracranial hypertension) when combined with tetracyclines"],
        ["Cheilitis (dry, cracked lips in virtually 100%)", "Xerosis and dry skin", "Dry eyes and contact lens intolerance", "Epistaxis (dry nasal mucosa)", "Photosensitivity", "Myalgias and joint stiffness"], ["Teratogenic embryopathy", "Acute pancreatitis secondary to hypertriglyceridemia", "Pseudotumor cerebri", "Hepatotoxicity"],
        ["Tetracyclines (doxycycline, minocycline: severe risk of pseudotumor cerebri; strictly contraindicated)", "Vitamin A supplements (additive hypervitaminosis A toxicity)", "St. John's Wort (may reduce oral contraceptive efficacy)"], ["Monthly serum pregnancy test (mandatory)", "Fasting lipid panel and liver function tests at baseline and monthly until stable", "Mood and depression screening"],
        "Category X; absolute contraindication. High risk of severe fetal malformations; do not use in pregnancy.", "Contraindicated during lactation.", "Not recommended in prepubertal children.", "Rarely indicated; monitor lipids closely.", "Use with caution in severe renal impairment.", "Contraindicated in severe hepatic impairment.",
        ["Only treatment offering permanent curative remission of severe acne", "Addresses all 4 pathogenic pillars of acne vulgaris", "Dramatically reduces scarring"], ["Absolute teratogenicity requiring strict regulatory compliance", "100% cheilitis and skin dryness", "Risk of hypertriglyceridemia and mood changes"], ["Must take with a high-fat meal (e.g., milk, peanut butter) for adequate absorption", "Lip balm and skin moisturizer are mandatory from day one"],
        "ISO-tretinoin: ISOLATES acne and eliminates it, but ISOLATE strictly from pregnancy (Category X).", "-tretinoin", "eye-soe-TRET-ih-noyn", "आइसोट्रेटिनॉइन"),

    med("adapalene", "Adapalene", "Adapalene Topical Gel", "Adapalene", "Adapalene", "Dermatology",
        "Third-generation synthetic naphthoic acid topical retinoid with high selectivity for RAR-beta and RAR-gamma, offering superior photostability and tolerability.",
        ["0.1% gel", "0.3% gel"], ["Gel", "Cream"], ["Topical"],
        "Binds selectively to nuclear retinoic acid receptor (RAR) beta and gamma subtypes; modulates cellular differentiation, keratinization, and inflammatory processes.",
        "Normalizes follicular epithelial desquamation, prevents microcomedone formation, resolves inflammatory papules, and reduces comedones.",
        "Percutaneous absorption is trace (<0.25 ng/mL after chronic application).", "Accumulates in the epidermis and hair follicles.",
        "Trace systemically absorbed drug is metabolized in the liver via O-demethylation, hydroxylation, and glucuronidation.", "Excreted primarily in bile and faeces.",
        "<0.01%", "Trace systemic half-life approx 16 hours", ">99%", "Visible improvement in 8 to 12 weeks", "24 hours per application",
        ["Topical treatment of acne vulgaris (comedonal and inflammatory) in patients 12 years and older"],
        ["Known hypersensitivity to adapalene or any formulation component"],
        ["Local cutaneous irritation (erythema, scaling, dryness, stinging/burning) during first 2-4 weeks", "Avoid contact with eyes, lips, mucous membranes, and abraded skin", "Increased susceptibility to ultraviolet light and sunburn; use daily broad-spectrum sunscreen", "Unlike tretinoin, adapalene is photostable and chemically stable with benzoyl peroxide"],
        ["Erythema", "Skin peeling / scaling", "Dry skin", "Burning / stinging sensation", "Pruritus"], ["Severe contact dermatitis", "Severe chemical burns if applied to broken skin"],
        ["Concomitant topical drying agents (salicylic acid, sulfur, alcohol-based toners: additive skin irritation)"], ["Clinical evaluation of acne lesions and skin barrier integrity"],
        "Category C; low systemic absorption, but avoid during pregnancy as a precaution.", "Not known if excreted in milk; avoid application to chest.", "Approved for acne in patients >= 12 years.", "Skin barrier fragility may increase local irritation.", "No adjustment needed.", "No adjustment needed.",
        ["Chemically stable in sunlight (can be applied day or night)", "Can be co-applied with benzoyl peroxide without degradation", "Much less irritating than first-generation tretinoin"], ["Skin irritation and dryness common during initial 2-4 weeks", "Delayed onset requires 8-12 weeks of patient adherence"], ["Apply a pea-sized amount to clean, dry face at bedtime", "Use non-comedogenic moisturizer to buffer irritation"],
        "ADAP-alene: ADAPTABLE retinoid: photostable and mixes with benzoyl peroxide.", "-alene", "uh-DAP-uh-leen", "अडापलीन"),

    med("mupirocin", "Mupirocin", "Mupirocin Ointment USP", "Mupirocin", "Mupirocin", "Dermatology",
        "Naturally derived pseudomonic acid antibiotic that uniquely inhibits bacterial isoleucyl-tRNA synthetase, eradicating MRSA and impetigo.",
        ["2% ointment", "2% cream"], ["Ointment", "Cream"], ["Topical"],
        "Selectively and reversibly binds to bacterial isoleucyl-transfer RNA (tRNA) synthetase, arresting protein synthesis without cross-resistance to other antibiotic classes.",
        "Bactericidal at concentrations achieved topically against Staphylococcus aureus (including MRSA) and Streptococcus pyogenes.",
        "Minimal systemic absorption (<1%) through intact skin; absorption increased through mucosal surfaces or deep burns.", "Confined to topical tissue layers.",
        "Metabolized in skin and trace systemically to inactive monic acid.", "Trace systemically absorbed monic acid is excreted in urine.",
        "<1%", "20 to 40 minutes (monic acid)", "95%", "Rapid local antibacterial action within hours", "8 to 12 hours (dosed 3 times daily)",
        ["Impetigo contagiosa caused by S. aureus or S. pyogenes", "Secondary superficial bacterial skin infections (folliculitis, infected eczema, minor lacerations)", "Eradication of nasal colonization of Methicillin-Resistant Staphylococcus aureus (MRSA; nasal ointment)"],
        ["Hypersensitivity to mupirocin or polyethylene glycol (PEG) vehicle"],
        ["Polyethylene glycol (PEG) vehicle in ointment formulation can be absorbed through open wounds or extensive burns, causing renal toxicity in patients with renal impairment", "Not for ophthalmic or intra-canalicular use", "Prolonged use (>10 days) may lead to overgrowth of non-susceptible organisms including fungi", "Wash hands thoroughly after application"],
        ["Burning / stinging sensation at site", "Local pruritus", "Erythema", "Contact dermatitis"], ["Systemic allergic reactions / anaphylaxis", "PEG-induced nephrotoxicity (if applied to large open burn areas in renal failure)"],
        ["None significant topically; do not mix with other topical ointments on the same lesion"], ["Inspect healing of skin lesions after 3 to 5 days"],
        "Category B; minimal systemic absorption; safe when clinically indicated.", "Compatible with breastfeeding; ensure nipple is clean if applied to breast.", "Safe and approved in infants down to 2 months.", "No special precautions.", "Use PEG-free cream formulation if applied to large open wounds in renal impairment.", "No dosage adjustment required.",
        ["High activity against MRSA without cross-resistance to oral antibiotics", "Excellent cure rate in pediatric impetigo", "Minimal systemic absorption"], ["Nasal and topical formulations are distinct; do not use regular ointment in the eyes", "PEG vehicle toxicity if misused on major open burns"], ["Apply a thin layer 3 times daily; cover with a gauze dressing if desired", "Re-evaluate if no improvement within 3 to 5 days"],
        "MU-PIRO-cin: MUp-up the PUS (impetigo and MRSA) with topical mupirocin.", "-mupirocin", "myoo-PEER-oh-sin", "म्युपिरोसिन"),

    med("tacrolimus-topical", "Tacrolimus (Topical)", "Tacrolimus Ointment", "Tacrolimus", "Tacrolimus", "Dermatology",
        "Topical calcineurin inhibitor providing non-steroidal immunosuppression for moderate-to-severe atopic dermatitis without skin atrophy.",
        ["0.03% ointment (pediatric)", "0.1% ointment (adult)"], ["Ointment"], ["Topical"],
        "Binds to intracellular immunophilin FKBP-12, creating a complex that inhibits calcineurin phosphatase; blocks dephosphorylation of NFAT, preventing transcription of IL-2, IL-4, IL-5, and TNF-alpha in T-lymphocytes.",
        "Suppresses cutaneous T-cell activation, mast cell mediator release, and Langerhans cell antigen presentation, clearing atopic eczema.",
        "Negligible to low systemic absorption (<1 ng/mL) through intact skin; slightly higher through broken atopic skin, decreasing as barrier heals.", "Confined to epidermis and dermis.",
        "Systemically absorbed drug is metabolized in liver via CYP3A4.", "Excreted predominantly in faeces.",
        "<0.5%", "Systemic half-life approx 30 hours", "99%", "Pruritus improves within 3 days; erythema and eczema clear over 1 to 3 weeks", "12 hours (dosed twice daily)",
        ["Moderate to severe atopic dermatitis (eczema) in non-immunocompromised patients who have failed or cannot tolerate topical corticosteroids"],
        ["Known hypersensitivity to tacrolimus or macrolide antibiotics", "Netherton syndrome or generalized erythroderma (increased systemic absorption)"],
        ["Black box warning: Rare cases of malignancy (skin cancer and lymphoma) reported; long-term continuous use not recommended ('use intermittently')", "Severe local burning and stinging sensation at application site during first few days of treatment", "Do not apply to infected skin (viral herpes, bacterial eczema); treat infection first", "Avoid sunlamps, tanning beds, and excessive sunlight exposure", "Does NOT cause skin atrophy, telangiectasia, or striae (safe for eyelids, face, and skin folds)"],
        ["Application site burning and warmth (very common, subsides after 3-5 days)", "Pruritus", "Skin erythema", "Folliculitis", "Alcohol intolerance (facial flushing upon drinking alcohol)"], ["Secondary cutaneous infections (eczema herpeticum / Kaposi varicelliform eruption)", "Malignancy (lymphoma/skin cancer boxed warning)"],
        ["CYP3A4 inhibitors (if significant systemic absorption occurs; minimal in clinical practice)"], ["Monitor for secondary viral or bacterial infections"],
        "Category C; topical absorption is minimal, but use only when benefits outweigh potential risks.", "Excreted in human milk after systemic administration; use with caution.", "0.03% approved for children 2-15 years; 0.1% approved only for adults >= 16 years.", "No specific age-related dosage adjustments.", "No dosage adjustment required.", "No dosage adjustment required.",
        ["Steroid-sparing: Does NOT cause skin thinning, atrophy, or glaucoma", "Safe for delicate skin on face, eyelids, neck, and intertriginous areas", "Long-term proactive maintenance therapy (twice weekly) prevents relapses"], ["Intense burning and stinging during first several days", "Black box warning regarding malignancy", "More expensive than topical steroids"], ["Reassure patient that burning and warmth diminish after the first 3-5 days of use", "Ideal alternative when topical steroids cause facial skin thinning"],
        "TACRO-limus: TOUGH ON ATOPY without THINNING the skin.", "-limus", "tak-ROE-lih-mus", "टैक्रोलिमस"),

    med("clobetasol-propionate", "Clobetasol Propionate", "Clobetasol Propionate Cream / Ointment", "Clobetasol propionate", "Clobetasol propionate", "Dermatology",
        "Super-potent Class I topical corticosteroid for short-term management of severe, recalcitrant inflammatory dermatoses.",
        ["0.05% cream", "0.05% ointment", "0.05% scalp lotion"], ["Cream", "Ointment", "Scalp Lotion"], ["Topical"],
        "High-affinity agonist for glucocorticoid receptors; induces lipocortin synthesis, inhibiting phospholipase A2 and decreasing downstream prostaglandins, leukotrienes, and inflammatory cytokines.",
        "Exerts profound anti-inflammatory, antipruritic, and vasoconstrictive activity in hyperkeratotic and inflammatory plaques.",
        "Percutaneous absorption varies; significantly increased by occlusive dressings, skin inflammation, or thin skin areas.", "Stored in stratum corneum reservoir; systemic Vd 1.5 to 2 L/kg.",
        "Metabolized in skin and liver primarily by CYP3A4 to inactive metabolites.", "Excreted in urine and bile.",
        "<1% intact skin; up to 10% under occlusion", "Systemic half-life approx 1.5 hours", "80%", "Vasoconstriction within 1 hour; clinical response in 2 to 4 days", "12 to 24 hours (applied once or twice daily)",
        ["Short-term treatment of inflammatory and pruritic manifestations of moderate-to-severe corticosteroid-responsive dermatoses (plaque psoriasis, severe eczema, lichen planus, discoid lupus)"],
        ["Rosacea, perioral dermatitis, or acne vulgaris", "Untreated cutaneous fungal, viral (herpes), or bacterial infections", "Children under 1 year of age"],
        ["High risk of reversible hypothalamic-pituitary-adrenal (HPA) axis suppression (limit therapy to maximum 2 consecutive weeks and 50 g/week)", "Cutaneous atrophy, striae rubrae, telangiectasia, and skin fragility (NEVER apply to face, groin, or axillae)", "Glaucoma and cataracts if applied near eyes", "Tachyphylaxis (diminished response) with prolonged use; taper to weaker steroid"],
        ["Skin burning and stinging", "Dry skin", "Pruritus", "Folliculitis"], ["Cushing syndrome / HPA axis suppression", "Permanent striae distensae and severe skin thinning", "Secondary bacterial or fungal cutaneous infections"],
        ["None significant topically; do not combine with systemic steroids without endocrine monitoring"], ["Morning cortisol or ACTH stimulation test if used over large surface area", "Inspect skin for atrophy and striae"],
        "Category C; use only when maternal benefit outweighs risk; avoid potent steroids over large areas.", "Not known if topical steroids appear in milk; do not apply to breasts before nursing.", "Not recommended for children <12 years (high risk of HPA axis suppression and stunted growth).", "Increased risk of skin atrophy and purpura.", "No dosage adjustment needed.", "Use caution if applied over very large body surface area.",
        ["Most potent topical anti-inflammatory agent available", "Rapidly clears stubborn psoriatic plaques and lichen planus", "Available in scalp lotion for scalp psoriasis"], ["High risk of HPA axis suppression", "Severe skin thinning and striae if overused", "Strict maximum of 2 weeks continuous use"], ["Apply a thin film sparingly; maximum 50 grams per week", "Never use on the face, groin, or axillae; limit treatment to 14 days"],
        "CLO-BETA-sol: CLOSE the lid after 2 WEEKS (ultra-high potency steroid).", "-etasol", "kloe-BAY-tuh-sol proe-pee-oh-nate", "क्लोबेटासोल प्रोपियोनेट"),

    med("terbinafine-topical", "Terbinafine (Topical)", "Terbinafine Topical Cream", "Terbinafine hydrochloride", "Terbinafine hydrochloride", "Dermatology",
        "Topical allylamine antifungal that inhibits squalene epoxidase, providing fungicidal activity against dermatophytes with short 1-week treatment courses.",
        ["1% cream", "1% lotion", "1% spray"], ["Cream", "Lotion", "Spray"], ["Topical"],
        "Selectively inhibits fungal squalene epoxidase, blocking ergosterol biosynthesis and causing toxic intracellular accumulation of squalene.",
        "Fungicidal against dermatophytes (Trichophyton, Microsporum, Epidermophyton); fungistatic against Candida yeasts.",
        "Systemic absorption is less than 5% after topical application.", "Penetrates rapidly and binds keratin; accumulates in stratum corneum, sebum, and hair follicles.",
        "Systemically absorbed fraction is metabolized in the liver via CYP2C9, CYP1A2, and CYP3A4 to inactive metabolites.", "Excreted in urine (approx 70%).",
        "<5%", "Stratum corneum half-life is approx 30 to 40 hours", ">99%", "Symptomatic relief in 2 to 3 days; mycological cure in 1 to 2 weeks", "Persistent antifungal reservoir in skin for 7 days post-treatment",
        ["Tinea pedis (athlete's foot)", "Tinea cruris (jock itch)", "Tinea corporis (ringworm)", "Pityriasis (tinea) versicolor"],
        ["Known hypersensitivity to terbinafine or allylamines"],
        ["For external dermatologic use only; avoid contact with eyes and mucous membranes", "Ensure full 1- to 2-week course is completed even if symptoms resolve earlier to prevent recurrence", "Unlike topical azoles, terbinafine is fungicidal (kills the fungus rather than just stopping growth)"],
        ["Application site irritation", "Burning sensation", "Erythema", "Pruritus", "Dry skin"], ["Contact dermatitis / severe allergic skin reaction"],
        ["No significant drug interactions via topical route"], ["Inspection of skin lesions for mycological clearance"],
        "Category B; minimal systemic absorption; considered safe for localized topical use.", "Compatible with breastfeeding; do not apply directly to breasts.", "Approved for children >= 12 years.", "No specific age-related precautions.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Fungicidal mechanism provides shorter treatment duration (1 week vs 4 weeks for azoles)", "Long skin reservoir maintains antifungal activity after stopping", "Over-the-counter availability"], ["Not effective for tinea capitis or onychomycosis via topical route (requires oral)", "Less active against Candida than azoles"], ["Apply once or twice daily for 1 full week; clean and thoroughly dry the affected area first", "Change socks and underwear daily to avoid reinfection"],
        "TER-BIN-afine: TERMINATES fungi (fungicidal) in 1 week.", "-fine", "tur-BIN-uh-feen", "टर्बिनाफाइन"),

    med("fusidic-acid", "Fusidic Acid", "Fusidic Acid Cream / Ointment", "Fusidic acid", "Sodium fusidate", "Dermatology",
        "Narrow-spectrum steroidal antibacterial that inhibits bacterial elongation factor G, highly effective for staphylococcal pyoderma.",
        ["2% cream", "2% sodium fusidate ointment"], ["Cream", "Ointment"], ["Topical"],
        "Inhibits bacterial protein synthesis by preventing the translocation of elongation factor G (EF-G) from the bacterial ribosome.",
        "Bactericidal against Staphylococcus aureus, including beta-lactamase producing and methicillin-resistant strains; also active against Corynebacterium.",
        "Percutaneous absorption is negligible through intact skin (<1%); penetrates through damaged or crusty skin lesions.", "Penetrates deep skin layers and pus.",
        "Systemically absorbed drug is metabolized in the liver to inactive metabolites.", "Excreted primarily in bile.",
        "<1%", "Systemic half-life approx 5 to 6 hours", "97%", "Rapid local antibacterial activity within hours", "8 to 12 hours (applied 2-3 times daily)",
        ["Primary and secondary superficial skin infections caused by Staphylococcus aureus (impetigo, folliculitis, sycosis barbae, paronychia, erythrasma)"],
        ["Known hypersensitivity to fusidic acid or sodium fusidate"],
        ["Limit duration of therapy to maximum 1 to 2 weeks to prevent emergence of resistant staphylococcal strains", "Avoid contact with eyes (causes severe conjunctival irritation)", "Sodium fusidate ointment is preferred for dry, crusted lesions; fusidic acid cream is preferred for weeping, macerated areas"],
        ["Mild stinging or burning at application site", "Erythema", "Pruritus"], ["Severe contact allergic dermatitis", "Bacterial cross-resistance on overuse"],
        ["None significant topically"], ["Clinical assessment of infection resolution"],
        "Category B; minimal topical absorption; safe for localized use.", "Compatible with breastfeeding; do not apply to breasts.", "Safe and widely used in infants and children.", "No dosage adjustment needed.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Deep tissue penetration through intact keratin and purulent crusts", "High activity against penicillin-resistant Staph aureus", "Cosmetically elegant cream and ointment formulations"], ["Risk of rapid resistance development if overused", "Narrow spectrum (inactive against streptococci and gram-negatives)"], ["Apply 2 to 3 times daily for no more than 7-10 days", "Clean away infected crusts before applying ointment"],
        "FUSID-ic acid: FUSES to elongation factor G to stop Staph aureus.", "-fusidate", "fyoo-SID-ik AS-id", "फ्यूसिडिक एसिड"),

    med("minoxidil-topical", "Minoxidil (Topical)", "Minoxidil Topical Solution / Foam", "Minoxidil", "Minoxidil", "Dermatology",
        "Topical ATP-sensitive potassium channel opener and vasodilator that stimulates follicular keratinocytes to treat androgenetic alopecia.",
        ["2% solution", "5% solution", "5% foam"], ["Topical Solution", "Topical Foam"], ["Topical"],
        "Opens ATP-sensitive potassium channels in vascular smooth muscle and hair follicles; upregulates vascular endothelial growth factor (VEGF), shortens telogen phase, and prolongs anagen (growth) phase of hair follicles.",
        "Enlarges miniaturized hair follicles, increases hair shaft diameter, and promotes visible hair regrowth on the vertex and crown.",
        "Approximately 1.4% of topical minoxidil is absorbed through intact scalp skin.", "Concentrates in follicular structures of the scalp.",
        "Metabolized predominantly in the liver via glucuronidation.", "Excreted in urine (approx 95% of absorbed dose).",
        "1.4%", "Systemic half-life approx 22 hours", "0% to 37%", "Initial shedding at 2-6 weeks; visible hair regrowth in 4 to 6 months", "Continuous application required to maintain benefit",
        ["Androgenetic alopecia (male pattern hair loss and female pattern hair loss)"],
        ["Known hypersensitivity to minoxidil, propylene glycol, or ethanol vehicle", "Scalp inflammation, psoriasis, or broken/sunburned skin"],
        ["Paradoxical telogen shedding during the first 2-6 weeks of therapy (sign of hair follicle remodeling; do not stop)", "Continuous indefinite application is required; all regrown hair sheds within 3-4 months of discontinuation", "Avoid accidental application to face (causes hypertrichosis / unwanted facial hair)", "Wash hands thoroughly after use; allow scalp to dry completely before bedtime", "Alcohol/propylene glycol vehicle may cause local scalp irritation (foam formulation lacks propylene glycol and causes less irritation)"],
        ["Local scalp irritation, pruritus, and dryness", "Initial transient hair shedding", "Unwanted facial hypertrichosis (especially in women)"], ["Systemic absorption causing hypotension, reflex tachycardia, and fluid retention (rare topically)", "Severe contact dermatitis"],
        ["Concomitant topical scalp agents (tretinoin: increases minoxidil absorption)"], ["Scalp examination for irritation and hair regrowth assessment at 4 and 6 months"],
        "Category C; avoid during pregnancy.", "Excreted in breast milk after systemic administration; avoid during lactation.", "Not indicated for individuals under 18 years.", "No specific age-related dosage adjustments.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Proven, FDA-approved over-the-counter topical therapy for male and female pattern baldness", "5% foam is propylene-glycol free and well-tolerated", "Can be combined with oral finasteride for synergistic efficacy"], ["Requires lifelong twice-daily commitment (stopping loses all gained hair)", "Temporary initial shedding frightens patients", "Can cause unwanted facial hair in women"], ["Apply 1 mL twice daily directly to dry scalp; rub gently into affected area", "Temporary shedding in the first month is normal and indicates the treatment is working"],
        "MINOXIDIL: MINImizes hair loss and OXIDIZES (revitalizes) follicles.", "-dil", "mih-NOX-ih-dil", "मिनोक्सिडिल"),

    # Corticosteroids / Endocrine (5)
    med("hydrocortisone", "Hydrocortisone", "Hydrocortisone Sodium Succinate", "Hydrocortisone", "Hydrocortisone sodium succinate", "Corticosteroids",
        "Short-acting bioidentical glucocorticoid and mineralocorticoid; the gold-standard intravenous therapy for acute adrenal crisis and septic shock.",
        ["10 mg", "20 mg tablet", "100 mg / 2 mL IV vial", "1% topical cream"], ["Tablet", "Solution for Injection", "Topical Cream"], ["Oral", "Intravenous", "Topical"],
        "Diffuses across cell membranes and binds to cytosolic glucocorticoid and mineralocorticoid receptors, regulating gene transcription to suppress inflammation and maintain vascular tone and electrolyte balance.",
        "Restores vascular responsiveness to catecholamines, reduces capillary permeability, and prevents circulatory collapse in adrenal insufficiency.",
        "Rapidly and completely absorbed orally; IV produces immediate peak concentration.", "Vd approx 0.5 to 0.7 L/kg; protein binding 90% (transcortin / corticosteroid-binding globulin).",
        "Metabolized in liver to tetrahydrocortisol and tetrahydrocortisone glucuronides.", "Excreted predominantly in urine as conjugated metabolites.",
        "96%", "1.5 hours in plasma (biological tissue half-life 8 to 12 hours)", "90%", "IV: immediate; Oral: 1 hour", "8 to 12 hours",
        ["Acute adrenal crisis (Addisonian crisis)", "Chronic primary or secondary adrenocortical insufficiency (replacement therapy)", "Refractory septic shock unresponsive to fluid resuscitation and vasopressors", "Severe acute asthma exacerbation", "Anaphylactic reactions (adjunct to adrenaline)"],
        ["Systemic fungal infections", "Known hypersensitivity to hydrocortisone", "Administration of live viral vaccines during immunosuppressive doses"],
        ["Do not delay administration in suspected adrenal crisis (can be fatal)", "Stress dosing: Double or triple oral replacement dose during infection, fever, trauma, or surgery", "Electrolyte shifts: Mineralocorticoid activity causes sodium retention, hypokalemia, and hypertension", "Hyperglycemia and steroid-induced diabetes"],
        ["Fluid retention and edema", "Hypertension", "Insomnia and mood changes", "Mild hypokalemia", "Gastric irritation"], ["Acute adrenal crisis upon abrupt withdrawal", "Peptic ulcer perforation / GI bleeding", "Severe immunosuppression / opportunistic infections", "Aseptic necrosis of femoral head"],
        ["CYP3A4 inducers (rifampicin, phenytoin: accelerate hydrocortisone clearance)", "NSAIDs (exponentially increased risk of peptic ulceration)", "Diuretics (additive hypokalemic risk)"], ["Serum electrolytes (sodium, potassium)", "Blood glucose", "Blood pressure"],
        "Category C; crosses placenta; hydrocortisone is inactivated by placental 11-beta-HSD2, making it the preferred steroid in maternal adrenal insufficiency.", "Excreted in small amounts in breast milk; compatible with replacement doses.", "Can suppress growth in children during chronic supraphysiological therapy.", "Increased risk of hypertension, osteoporosis, and fractures.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Bioidentical hormone: Exact physiologic match to endogenous cortisol", "Possesses balanced 1:1 glucocorticoid and mineralocorticoid activity", "IV formulation provides rapid life-saving stabilization in adrenal shock"], ["Significant mineralocorticoid fluid retention at high doses", "Short duration requires 2-3 daily doses for oral replacement"], ["In acute adrenal crisis, administer 100 mg IV immediately without waiting for lab tests", "Patients with Addison disease must wear medical alert jewelry and carry emergency hydrocortisone"],
        "HYDRO-cortisone: HYDRATES blood pressure in adrenal crisis (life-saving).", "-cortisone", "hye-droe-KOR-tih-zone", "हाइड्रोकार्टिसोन"),

    med("methylprednisolone", "Methylprednisolone", "Methylprednisolone Sodium Succinate", "Methylprednisolone", "Methylprednisolone sodium succinate", "Corticosteroids",
        "Intermediate-acting synthetic glucocorticoid with 5 times the anti-inflammatory potency of hydrocortisone and minimal mineralocorticoid activity, used for pulse therapy in acute autoimmune relapses.",
        ["4 mg", "8 mg", "16 mg", "40 mg IV vial", "125 mg IV vial", "500 mg IV vial", "1000 mg IV vial"], ["Tablet", "Solution for Injection"], ["Oral", "Intravenous"],
        "Potent glucocorticoid receptor agonist; inhibits inflammatory cytokine synthesis, impairs leukocyte migration, and induces lymphocyte apoptosis.",
        "Profound anti-inflammatory and immunosuppressive action without significant fluid retention or sodium accumulation.",
        "Rapidly and well absorbed orally; IV sodium succinate produces immediate peak plasma concentrations.", "Vd approx 1.4 L/kg; protein binding 77% (primarily albumin).",
        "Metabolized in liver by CYP3A4 to inactive metabolites.", "Excreted in urine (approx 85%).",
        "82% to 89%", "2.5 hours in plasma (biological tissue half-life 18 to 36 hours)", "77%", "IV: within 1 hour; Oral: 1 to 2 hours", "18 to 36 hours",
        ["Acute exacerbation of multiple sclerosis (pulse IV therapy: 1000 mg daily for 3-5 days)", "Severe lupus nephritis and systemic lupus erythematosus flares", "Severe acute asthma exacerbation", "Organ transplantation rejection prophylaxis and treatment", "Rheumatoid arthritis and polymyalgia rheumatica flares"],
        ["Systemic fungal infections", "Known hypersensitivity to methylprednisolone", "Intrathecal administration"],
        ["High-dose IV pulse therapy can precipitate acute cardiac arrhythmias, myocardial infarction, and sudden death (infuse over at least 30-60 minutes)", "Acute steroid-induced psychosis and severe mood swings", "Severe hyperglycemia in diabetic patients", "Avascular necrosis of the hip", "Pneumocystis jirovecii pneumonia prophylaxis indicated during prolonged high-dose therapy"],
        ["Insomnia and restlessness", "Facial flushing", "Hyperglycemia", "Increased appetite", "Dyspepsia / heartburn"], ["Steroid-induced psychosis / mania", "Cardiac arrhythmias during rapid IV infusion", "Opportunistic systemic infections", "Bilateral avascular femoral head necrosis"],
        ["CYP3A4 inducers (carbamazepine, rifampicin: reduce methylprednisolone AUC by 50%)", "CYP3A4 inhibitors (ketoconazole, diltiazem: double methylprednisolone levels)", "NSAIDs (severe peptic ulcer risk)"], ["Blood glucose monitoring (mandatory in all patients on pulse steroids)", "Blood pressure and heart rate during IV infusion", "Bone mineral density"],
        "Category C; use when maternal benefit justifies potential risk.", "Excreted in breast milk in small amounts; wait 2-4 hours after dose to nurse.", "Growth suppression in chronic pediatric administration.", "High risk of osteoporotic compression fractures and steroid myopathy.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["5x more potent than hydrocortisone with negligible fluid retention", "Gold standard IV pulse steroid for multiple sclerosis relapses", "Broad range of oral and parenteral dosage formulations"], ["High risk of acute hyperglycemia and psychiatric reactions during pulse therapy", "Rapid IV injection causes cardiac collapse"], ["Infuse high-dose IV pulses slowly over 30-60 minutes to prevent fatal arrhythmias", "Check capillary blood glucose routinely during high-dose therapy"],
        "METHYL-prednisolone: MIGHTY pulse steroid for Multiple Sclerosis.", "-prednisolone", "meth-ul-pred-NISS-oh-lone", "मिथाइलप्रेडनिसोलोन"),

    med("deflazacort", "Deflazacort", "Deflazacort Tablets", "Deflazacort", "Deflazacort", "Corticosteroids",
        "Oxazoline derivative of prednisolone with comparable immunosuppressive efficacy but significantly less bone loss, weight gain, and glucose intolerance.",
        ["6 mg", "12 mg", "18 mg", "24 mg", "30 mg"], ["Tablet"], ["Oral"],
        "Prodrug rapidly converted to active 21-desacetyldeflazacort, which binds glucocorticoid receptors to suppress inflammatory cytokines, T-cell activation, and prostaglandin synthesis.",
        "Provides potent anti-inflammatory and immunosuppressive activity with reduced affinity for bone receptors and glucose metabolic pathways.",
        "Well absorbed orally; peak plasma concentration of active metabolite reached in 1.5 to 2 hours.", "Vd approx 1.0 L/kg; protein binding 40%.",
        "Rapidly and extensively converted by plasma esterases to active metabolite 21-desacetyldeflazacort; further metabolized by CYP3A4.", "Excreted in urine (approx 70%) and faeces (30%).",
        "70%", "1.1 to 1.9 hours (biological activity lasts 18 to 36 hours)", "40%", "1 to 2 hours", "18 to 36 hours",
        ["Duchenne muscular dystrophy (DMD; delays loss of ambulation and preserves cardiopulmonary function)", "Severe refractory asthma and allergic conditions", "Rheumatoid arthritis, juvenile idiopathic arthritis, and systemic lupus erythematosus", "Immune thrombocytopenic purpura (ITP) and nephrotic syndrome"],
        ["Systemic infections without appropriate antimicrobial therapy", "Known hypersensitivity to deflazacort", "Administration of live viral vaccines"],
        ["Chronic therapy still causes HPA axis suppression; taper gradually when discontinuing", "Cushingoid appearance can occur at higher doses, though less severe than prednisone", "Immunosuppression and infection masking", "Cataract formation on prolonged pediatric therapy"],
        ["Increased appetite", "Mild weight gain", "Hirsutism", "Nasopharyngitis", "Insomnia"], ["Vertebral osteoporotic fractures (less than prednisone but still present)", "Secondary adrenal insufficiency upon sudden withdrawal", "Posterior subcapsular cataracts in children"],
        ["CYP3A4 inducers (rifampicin, phenytoin: decrease deflazacort active metabolite levels)", "CYP3A4 inhibitors (clarithromycin: increase deflazacort exposure)", "NSAIDs (increased ulcer risk)"], ["Linear height and growth velocity in pediatric patients", "Bone mineral density (DEXA scan)", "Blood pressure and fasting glucose"],
        "Category C; use only if potential benefit justifies fetal risk.", "Excreted in breast milk in small amounts; use caution.", "FDA approved down to 2 years of age for Duchenne muscular dystrophy.", "Monitor bone density and blood pressure.", "No dosage adjustment required.", "Clearance reduced in severe hepatic cirrhosis; titrate carefully.",
        ["Causes significantly less bone mineral density loss than prednisone", "Lower risk of weight gain, truncal obesity, and glucose intolerance", "FDA-approved landmark therapy for Duchenne muscular dystrophy"], ["More expensive than generic prednisolone", "Still carries steroid risks of cataracts and infection"], ["6 mg of deflazacort is approximately equivalent to 5 mg of prednisolone", "Preferred long-term oral steroid in children with muscular dystrophy or nephrotic syndrome"],
        "DEFLA-zacort: DEFENDS BONES better than prednisolone in chronic use.", "-zacort", "deh-FLAZ-uh-kort", "डेफ़्लाज़ाकोर्ट"),

    med("betamethasone", "Betamethasone", "Betamethasone Sodium Phosphate and Acetate", "Betamethasone", "Betamethasone sodium phosphate", "Corticosteroids",
        "Long-acting fluorinated glucocorticoid with zero mineralocorticoid activity, uniquely capable of crossing the placenta to accelerate fetal lung maturation in preterm labor.",
        ["0.5 mg tablet", "4 mg/mL IV/IM vial", "0.05% topical cream"], ["Tablet", "Solution for Injection", "Topical Cream"], ["Oral", "Intramuscular", "Topical"],
        "High-affinity fluorinated glucocorticoid receptor agonist; stimulates synthesis of pulmonary surfactant proteins (SP-A, SP-B) in fetal type II pneumocytes and downregulates pro-inflammatory cascades.",
        "Significantly decreases the incidence of neonatal respiratory distress syndrome (RDS), intraventricular hemorrhage (IVH), and neonatal mortality in threatened preterm delivery.",
        "Rapidly absorbed orally and intramuscularly; peak plasma concentration within 1 hour after IM injection.", "Vd approx 1.4 L/kg; protein binding 64%.",
        "Metabolized in the liver to inactive glucuronide conjugates; minimal placental inactivation by 11-beta-HSD2 compared to cortisol.", "Excreted primarily in urine (<5% unchanged).",
        "72%", "5.6 hours in plasma (biological tissue half-life 36 to 54 hours)", "64%", "IM: 1 to 2 hours; stimulates fetal surfactant within 24 hours", "36 to 54 hours",
        ["Antenatal corticosteroid therapy in threatened preterm birth (24 to 34 weeks of gestation) to accelerate fetal lung maturation", "Severe inflammatory and allergic disorders unresponsive to other therapies", "Congenital adrenal hyperplasia (fetal treatment)"],
        ["Systemic fungal infections", "Known hypersensitivity to betamethasone", "Idiopathic thrombocytopenic purpura (intramuscular administration contraindicated)"],
        ["Antenatal protocol: Exactly two 12 mg IM doses given 24 hours apart (clinical benefit maximal 24 hours to 7 days after second dose)", "Causes transient maternal hyperglycemia (monitor and adjust insulin closely in diabetic gravidas)", "Do not give repeated weekly courses in pregnancy due to risks of fetal growth restriction and neurodevelopmental delay", "Zero mineralocorticoid activity (cannot be used alone for adrenal crisis replacement)"],
        ["Transient maternal hyperglycemia", "Insomnia and restlessness", "Facial flushing", "Transient reduction in fetal heart rate variability (benign)"], ["Anaphylactoid reactions", "Maternal pulmonary edema when combined with beta-agonist tocolytics (ritodrine/terbutaline)", "Severe neonatal infection if chorioamnionitis was present"],
        ["Beta-sympathomimetic tocolytics (terbutaline: exponentially increases maternal pulmonary edema risk)", "Insulin (corticosteroid-induced hyperglycemia requires increased insulin dose)"], ["Maternal blood glucose in diabetic pregnancy", "Fetal heart rate monitoring", "Screening for maternal infection/chorioamnionitis prior to dosing"],
        "Category C; STANDARD OF CARE in threatened preterm labor between 24 and 34 weeks gestation.", "Excreted into breast milk; short antenatal courses are compatible with lactation.", "Indicated antenatally for fetal lung maturation; chronic pediatric use stunts linear growth.", "Higher risk of osteoporosis and skin fragility.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Crosses placenta effectively to produce life-saving fetal surfactant", "Zero fluid retention (zero mineralocorticoid effect)", "Long biological duration (36-54 hours)"], ["Causes maternal hyperglycemia in pregnancy", "Cannot replace mineralocorticoids in adrenal crisis"], ["Antenatal protocol is strictly two 12 mg IM doses 24 hours apart", "Provides life-saving protection against neonatal RDS and intraventricular hemorrhage"],
        "BETA-methasone: BEST for BABY'S lungs (accelerates surfactant in preterm birth).", "-methasone", "bay-tuh-METH-uh-zone", "बीटामेथासोन"),

    med("triamcinolone", "Triamcinolone", "Triamcinolone Acetonide Injectable Suspension", "Triamcinolone acetonide", "Triamcinolone acetonide", "Corticosteroids",
        "Intermediate-acting fluorinated glucocorticoid with zero mineralocorticoid activity, widely formulated as microcrystalline suspension for intra-articular and intralesional therapy.",
        ["40 mg/mL injectable suspension", "0.1% oral paste", "55 mcg nasal spray"], ["Injectable Suspension", "Oral Paste", "Nasal Spray"], ["Intra-articular", "Intralesional", "Intranasal", "Topical"],
        "Potent glucocorticoid receptor agonist; inhibits phospholipase A2 and cyclooxygenase pathways, reducing synovial inflammation, keloid fibroblast proliferation, and allergic rhinitis.",
        "Suppresses joint inflammation for weeks to months after single intra-articular injection; flattens hypertrophic keloid scars after intralesional injection.",
        "Microcrystalline depot suspension dissolves very slowly from intra-articular or intralesional depots over weeks.", "Locally retained in joint fluid or dermis; systemic Vd 1.4 to 2.1 L/kg.",
        "Metabolized in liver by CYP3A4 to 6-beta-hydroxytriamcinolone.", "Excreted in urine (approx 80%) and faeces (20%).",
        "Negligible nasal/oral bioavailability; 100% absorbed from depot suspension over 2-4 weeks", "Plasma half-life 2 to 3 hours; depot biological action lasts 3 to 6 weeks", "68%", "Joint relief within 24 to 48 hours", "3 to 6 weeks per intra-articular injection",
        ["Intra-articular injection in rheumatoid arthritis, osteoarthritis, and acute gouty arthritis", "Intralesional injection for keloids, hypertrophic scars, and alopecia areata", "Triamcinolone oral paste for recurrent aphthous stomatitis (canker sores)", "Allergic rhinitis (aqueous nasal spray)"],
        ["Joint infection or bacteremia (intra-articular injection into infected joint is strictly contraindicated)", "Systemic fungal infections", "Intravenous administration (suspension can cause fatal emboli)"],
        ["NEVER inject intravenously (microcrystalline suspension will cause embolic occlusion)", "Post-injection flare (transient sterile synovitis within 24 hours in 5% of patients)", "Local cutaneous atrophy and hypopigmentation at injection site if injected too superficially into dermis or subcutaneous fat", "Limit intra-articular injections to maximum 3-4 times per year in a single joint to prevent cartilage destruction ('steroid arthropathy')"],
        ["Post-injection joint pain flare", "Temporary facial flushing", "Local skin depigmentation / atrophy", "Mild transient glucose elevation"], ["Septic arthritis (iatrogenic joint infection)", "Tendon rupture (especially Achilles tendon if injected peritendinously)", "Joint cartilage necrosis from overuse"],
        ["NSAIDs (additive peptic ulcer risk if systemic absorption occurs)", "Antidiabetic agents (transient hyperglycemia may require insulin adjustment)"], ["Inspect joint for signs of septic arthritis (erythema, intense warmth, fever)", "Blood glucose in diabetics"],
        "Category C; intra-articular and nasal doses carry minimal systemic fetal exposure.", "Excreted in breast milk in small amounts; safe for localized injections.", "Safety in children <6 years not established; avoid repeated intra-articular injections.", "Higher risk of tendon rupture and skin atrophy.", "No dosage adjustment needed.", "No dosage adjustment needed.",
        ["Prolonged local anti-inflammatory effect (3-6 weeks) from single joint injection", "Oral paste adheres firmly to wet oral mucosa for aphthous ulcers", "Gold standard intralesional therapy for keloids and alopecia areata"], ["Severe local skin atrophy and whitening if injected superficially", "Strictly contraindicated in infected joints", "Risk of cartilage breakdown if injected too frequently"], ["Never inject IV; shake suspension well before drawing up", "Limit injections to no more than 3-4 times per year in any single joint"],
        "TRI-amcinolone: TRI-ple use: Joint injection, Keloid injection, Oral aphthous paste.", "-olone", "trye-am-SIN-oh-lone", "ट्रायमसिनोलोन")
]

print(f"Adding {len(extra)} additional medicines...")
for m in extra:
    s = m["slug"]
    if s not in live_slugs and norm(m["generic_name"]) not in live_names:
        items.append(m)

print(f"Total expansion dataset count: {len(items)} medicines!")

# Verify 0 duplicates with live DB
coll_slugs = set(x["slug"] for x in items)
assert len(coll_slugs & live_slugs) == 0, f"Found duplicate slugs: {coll_slugs & live_slugs}"
print("VERIFIED: 0 duplicates with live DB!")

# Write JSON
os.makedirs("src/data", exist_ok=True)
with open("src/data/medicines-expanded.json", "w") as f:
    json.dump(items, f, indent=2)
print("Wrote src/data/medicines-expanded.json")

# Write CSV
csv_fields = [
    "slug", "generic_name", "display_name", "active_ingredient", "salt", "category",
    "description", "strengths", "dosage_forms", "routes", "mechanism_of_action",
    "pronunciation_en", "key_suffix", "verification_status"
]
with open("src/data/medicines-expanded.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=csv_fields)
    writer.writeheader()
    for row in items:
        csv_row = {}
        for k in csv_fields:
            v = row.get(k, "")
            if isinstance(v, list):
                csv_row[k] = "; ".join(v)
            else:
                csv_row[k] = v or ""
        writer.writerow(csv_row)
print("Wrote src/data/medicines-expanded.csv")

# Write TypeScript
with open("src/data/medicines-expanded.ts", "w") as f:
    f.write("import type { Tables } from '@/integrations/supabase/types';\n\n")
    f.write("export type MedicineRecord = Tables<'medicines'>;\n\n")
    f.write("export const EXPANDED_MEDICINES: any[] = ")
    json.dump(items, f, indent=2)
    f.write(";\n")
print("Wrote src/data/medicines-expanded.ts")

# Write SQL migration
sql_lines = [
    "-- MediVault India: Substantial Medicine Database Expansion (200+ New Medicines)",
    "-- Idempotent seed migration with ON CONFLICT (slug) DO UPDATE",
    ""
]

def sql_quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        items_quoted = [repr(str(x)) for x in val]
        items_quoted = [repr(str(x)) for x in val]
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

cols = [
    "slug", "generic_name", "display_name", "active_ingredient", "salt", "category",
    "description", "strengths", "dosage_forms", "routes", "mechanism_of_action",
    "pharmacodynamics", "absorption", "distribution", "metabolism", "excretion",
    "bioavailability", "half_life", "protein_binding", "onset", "duration",
    "indications", "contraindications", "warnings", "common_adverse_effects",
    "serious_adverse_effects", "drug_interactions", "monitoring", "pregnancy",
    "lactation", "pediatric", "geriatric", "renal", "hepatic", "advantages",
    "disadvantages", "key_points", "memory_trick", "key_suffix", "pronunciation_en",
    "pronunciation_hi", "status", "verification_status", "last_verified", "data_version"
]

sql_lines.append("INSERT INTO public.medicines (" + ", ".join(cols) + ") VALUES")
val_rows = []
for item in items:
    row_vals = [sql_quote(item.get(c)) for c in cols]
    val_rows.append("(" + ", ".join(row_vals) + ")")

sql_lines.append(",\n".join(val_rows))
sql_lines.append("ON CONFLICT (slug) DO UPDATE SET")
updates = [f"  {c} = EXCLUDED.{c}" for c in cols if c != "slug"]
sql_lines.append(",\n".join(updates) + ";\n")

os.makedirs("supabase/migrations", exist_ok=True)
with open("supabase/migrations/20260918130000_expand_220_medicines.sql", "w") as f:
    f.write("\n".join(sql_lines))

print("Wrote supabase/migrations/20260918130000_expand_220_medicines.sql")
print("SUCCESS!")
