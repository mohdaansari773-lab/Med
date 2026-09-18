/**
 * Beginner-friendly explanations for medical / pharmacology terms.
 * Simple English + medical definition + Hinglish + Hindi.
 * Extend freely — keys are lowercased term names. Aliases map to a canonical key.
 */
export type GlossaryEntry = {
  term: string;
  /** Plain-English one-liner. */
  simple: string;
  /** Textbook-style definition. */
  medical?: string;
  hinglish: string;
  hindi?: string;
  pronunciation?: string;
  examples?: string[];
  related?: string[];
};

function e(entry: GlossaryEntry): GlossaryEntry {
  return entry;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  adme: e({
    term: "ADME",
    simple:
      "ADME stands for Absorption, Distribution, Metabolism and Excretion — what the body does with a medicine.",
    medical:
      "The four pharmacokinetic processes that describe a drug's journey through the body from intake to elimination.",
    hinglish:
      "ADME ka matlab hai Absorption, Distribution, Metabolism aur Excretion — yani body medicine ke saath kya karti hai.",
    hindi:
      "ADME का अर्थ है अवशोषण, वितरण, चयापचय और उत्सर्जन — यानी शरीर दवा के साथ क्या करता है।",
    pronunciation: "AY-DEE-EM-EE",
    related: ["Absorption", "Distribution", "Metabolism", "Excretion", "Pharmacokinetics"],
  }),
  pharmacokinetics: e({
    term: "Pharmacokinetics",
    simple: "What the body does to the medicine over time.",
    medical:
      "Study of absorption, distribution, metabolism and excretion, and the resulting drug concentration–time profile.",
    hinglish: "Pharmacokinetics batata hai ki body medicine ke saath kya karti hai.",
    hindi: "फार्माकोकाइनेटिक्स बताता है कि शरीर दवा के साथ क्या करता है।",
    pronunciation: "far-ma-ko-ki-NET-iks",
    related: ["ADME", "Half-life", "Bioavailability", "Clearance"],
  }),
  pharmacodynamics: e({
    term: "Pharmacodynamics",
    simple: "What the medicine does to the body.",
    medical:
      "Study of the biochemical and physiological effects of a drug and its mechanism of action, including dose–response relationships.",
    hinglish: "Pharmacodynamics batata hai ki medicine body par kya effect karti hai.",
    hindi: "फार्माकोडायनामिक्स बताता है कि दवा शरीर पर क्या असर करती है।",
    pronunciation: "far-ma-ko-die-NAM-iks",
    related: ["Mechanism of Action", "Receptor", "Agonist", "Antagonist"],
  }),
  bioavailability: e({
    term: "Bioavailability",
    simple: "The fraction of a dose that actually reaches the bloodstream unchanged.",
    medical:
      "The rate and extent to which the active drug reaches systemic circulation; intravenous dosing is defined as 100%.",
    hinglish: "Dose ka kitna hissa asal mein blood tak pahunchta hai, wahi bioavailability hai.",
    hindi: "खुराक का कितना भाग वास्तव में रक्त तक पहुँचता है।",
    pronunciation: "bye-oh-a-vail-a-BIL-i-tee",
    related: ["Absorption", "Pharmacokinetics"],
  }),
  "half-life": e({
    term: "Half-life",
    simple: "The time needed for the drug level in blood to fall to half its value.",
    medical:
      "t½ — time required for plasma concentration to decrease by 50%; guides dosing interval and time to steady state.",
    hinglish: "Blood mein medicine ka level aadha hone mein jitna time lagta hai.",
    hindi: "रक्त में दवा का स्तर आधा होने में लगने वाला समय।",
    related: ["Clearance", "Pharmacokinetics"],
  }),
  clearance: e({
    term: "Clearance",
    simple: "How fast the body removes a drug, usually by the kidneys or liver.",
    medical:
      "Volume of plasma cleared of drug per unit time; the primary determinant of maintenance dose.",
    hinglish: "Body kitni tezi se medicine ko hataati hai — mostly kidney ya liver ke through.",
    hindi: "शरीर दवा को कितनी तेज़ी से बाहर निकालता है।",
    related: ["Excretion", "Renal", "Hepatic"],
  }),
  "volume of distribution": e({
    term: "Volume of Distribution",
    simple: "A calculated value showing how widely a drug spreads into body tissues.",
    medical:
      "Vd — the theoretical volume needed to contain the total amount of drug at the observed plasma concentration.",
    hinglish: "Medicine body tissues mein kitna failti hai, uska calculated measure.",
    hindi: "दवा शरीर के ऊतकों में कितनी फैलती है, इसका गणनात्मक माप।",
    related: ["Distribution", "Protein Binding"],
  }),
  "protein binding": e({
    term: "Protein Binding",
    simple: "The share of drug attached to blood proteins; only the free part works.",
    medical:
      "Reversible binding to plasma proteins such as albumin; only the unbound fraction is pharmacologically active.",
    hinglish:
      "Medicine ka jitna hissa blood proteins se juda hota hai; sirf free part kaam karta hai.",
    hindi: "दवा का जितना भाग रक्त प्रोटीन से जुड़ा होता है; केवल मुक्त भाग काम करता है।",
    related: ["Distribution", "Volume of Distribution"],
  }),
  "mechanism of action": e({
    term: "Mechanism of Action",
    simple: "The exact way a medicine produces its effect in the body.",
    medical:
      "The specific molecular interaction — receptor, enzyme, channel or transporter — through which a drug exerts its effect.",
    hinglish: "Medicine body mein apna effect kaise deti hai, wahi mechanism of action hai.",
    hindi: "दवा शरीर में अपना असर किस तरह करती है।",
    related: ["Receptor", "Enzyme Inhibitor", "Pharmacodynamics"],
  }),
  "therapeutic class": e({
    term: "Therapeutic Class",
    simple: "Grouping of medicines by the condition they treat, e.g. antihypertensive.",
    medical: "Classification based on the clinical indication or disease treated.",
    hinglish: "Medicines ko unke use/disease ke hisaab se group karna, jaise antihypertensive.",
    hindi: "दवाओं को उनके उपयोग/रोग के आधार पर समूहित करना।",
    examples: ["Antihypertensive", "Analgesic", "Antidiabetic"],
    related: ["Pharmacological Class", "Chemical Class"],
  }),
  "pharmacological class": e({
    term: "Pharmacological Class",
    simple: "Grouping of medicines by how they work, e.g. beta blocker.",
    medical: "Classification based on shared mechanism of action or molecular target.",
    hinglish: "Medicines ko unke kaam karne ke tarike se group karna, jaise beta blocker.",
    hindi: "दवाओं को उनके काम करने के तरीके के आधार पर समूहित करना।",
    examples: ["Beta blocker", "ACE inhibitor", "Proton pump inhibitor"],
    related: ["Therapeutic Class", "Mechanism of Action"],
  }),
  "chemical class": e({
    term: "Chemical Class",
    simple: "Grouping of medicines by their chemical structure.",
    medical:
      "Classification by core chemical scaffold, e.g. benzodiazepines, beta-lactams, dihydropyridines.",
    hinglish: "Medicines ko unke chemical structure ke hisaab se group karna.",
    hindi: "दवाओं को उनकी रासायनिक संरचना के आधार पर समूहित करना।",
    examples: ["Benzodiazepines", "Beta-lactams", "Dihydropyridines"],
    related: ["Pharmacological Class"],
  }),
  "adverse effects": e({
    term: "Adverse Effects",
    simple: "Unwanted or harmful effects that a medicine can cause.",
    medical:
      "Any noxious, unintended response to a drug occurring at doses normally used in humans.",
    hinglish: "Medicine se hone wale unwanted ya nuksandeh effects.",
    hindi: "दवा से होने वाले अवांछित या हानिकारक प्रभाव।",
    related: ["Side Effect", "Precautions"],
  }),
  "side effect": e({
    term: "Side Effect",
    simple: "A secondary effect of a medicine, which may be harmless or unwanted.",
    medical:
      "A predictable, dose-related effect other than the intended therapeutic effect; not always harmful.",
    hinglish: "Medicine ka doosra effect, jo harmless bhi ho sakta hai aur unwanted bhi.",
    hindi: "दवा का द्वितीयक प्रभाव, जो हानिरहित या अवांछित हो सकता है।",
    related: ["Adverse Effects"],
  }),
  contraindications: e({
    term: "Contraindications",
    simple: "Situations where a medicine should not be used because of risk of harm.",
    medical:
      "Clinical conditions in which a drug must be avoided (absolute) or used only with strong justification (relative).",
    hinglish:
      "Aisi situations jahan kisi medicine ka use nahi karna chahiye, kyunki harm ka risk hota hai.",
    hindi: "ऐसी स्थितियाँ जिनमें दवा का उपयोग नहीं करना चाहिए।",
    related: ["Precautions", "Warnings"],
  }),
  precautions: e({
    term: "Precautions",
    simple: "Extra care needed when using a medicine in certain people or conditions.",
    medical: "Conditions requiring dose adjustment, monitoring or increased vigilance.",
    hinglish: "Kuch logon ya conditions mein medicine use karte waqt extra dhyan rakhna.",
    hindi: "कुछ लोगों या स्थितियों में दवा लेते समय अतिरिक्त सावधानी।",
    related: ["Contraindications", "Monitoring"],
  }),
  warnings: e({
    term: "Warnings",
    simple: "Serious risks a prescriber and patient must know about before use.",
    medical: "Statements highlighting significant hazards, often regulator-mandated.",
    hinglish: "Serious risks jinke baare mein medicine lene se pehle jaanna zaroori hai.",
    hindi: "गंभीर जोखिम जिनकी जानकारी दवा लेने से पहले आवश्यक है।",
    related: ["Contraindications"],
  }),
  "drug interactions": e({
    term: "Drug Interactions",
    simple: "Changes in effect when two medicines (or a medicine and food) are taken together.",
    medical:
      "Pharmacokinetic or pharmacodynamic modification of one drug's effect by another substance.",
    hinglish: "Do medicines (ya medicine aur food) saath lene par effect badal jana.",
    hindi: "दो दवाएँ साथ लेने पर उनके प्रभाव में बदलाव।",
    related: ["Enzyme Inhibitor", "Metabolism"],
  }),
  indication: e({
    term: "Indication",
    simple: "The condition or reason for which a medicine is approved or used.",
    medical: "A clinical condition for which the drug has established therapeutic benefit.",
    hinglish: "Jis condition ke liye medicine di jati hai, wahi indication hai.",
    hindi: "जिस स्थिति के लिए दवा दी जाती है।",
    related: ["Therapeutic Class"],
  }),
  "route of administration": e({
    term: "Route of Administration",
    simple: "How a medicine is given — oral, IV, topical and so on.",
    medical: "The path by which a drug is brought into contact with the body.",
    hinglish: "Medicine kaise di jaati hai — oral, IV, topical waghera.",
    hindi: "दवा किस रास्ते से दी जाती है — मुँह से, नस से, त्वचा पर आदि।",
    examples: ["Oral", "Intravenous", "Topical", "Inhalation"],
  }),
  pregnancy: e({
    term: "Pregnancy",
    simple: "Guidance on using the medicine during pregnancy.",
    medical:
      "Assessment of teratogenic and foetal risk versus maternal benefit across trimesters.",
    hinglish: "Pregnancy ke dauraan medicine use karne se judi guidance.",
    hindi: "गर्भावस्था के दौरान दवा के उपयोग से जुड़ी जानकारी।",
    related: ["Lactation"],
  }),
  lactation: e({
    term: "Lactation",
    simple: "Guidance for breastfeeding mothers.",
    medical: "Consideration of drug transfer into breast milk and infant exposure risk.",
    hinglish: "Lactation breastfeeding se related term hai.",
    hindi: "स्तनपान से संबंधित जानकारी।",
    related: ["Pregnancy", "Pediatric"],
  }),
  pediatric: e({
    term: "Pediatric",
    simple: "Medical information related to children.",
    medical:
      "Dosing and safety considerations for neonates, infants, children and adolescents, usually weight-based.",
    hinglish: "Children se related medical information ko pediatric kaha jata hai.",
    hindi: "बच्चों से संबंधित चिकित्सा जानकारी।",
    pronunciation: "pee-dee-AT-rik",
    related: ["Geriatric"],
  }),
  geriatric: e({
    term: "Geriatric",
    simple: "Medical information related to older adults.",
    medical:
      "Considerations for elderly patients: reduced renal/hepatic function, polypharmacy and higher sensitivity.",
    hinglish: "Geriatric ka matlab older/elderly adults se related medical information.",
    hindi: "वृद्ध लोगों से संबंधित चिकित्सा जानकारी।",
    pronunciation: "jer-ee-AT-rik",
    related: ["Renal", "Hepatic"],
  }),
  renal: e({
    term: "Renal",
    simple: "Related to the kidneys.",
    medical:
      "Kidney-related; renal impairment often requires dose reduction for renally cleared drugs.",
    hinglish: "Renal ka relation kidneys se hota hai.",
    hindi: "गुर्दों (किडनी) से संबंधित।",
    pronunciation: "REE-nal",
    related: ["Excretion", "Clearance"],
  }),
  hepatic: e({
    term: "Hepatic",
    simple: "Related to the liver.",
    medical: "Liver-related; hepatic impairment affects drug metabolism and dosing.",
    hinglish: "Hepatic ka relation liver se hota hai.",
    hindi: "यकृत (लिवर) से संबंधित।",
    pronunciation: "heh-PAT-ik",
    related: ["Metabolism"],
  }),
  monitoring: e({
    term: "Monitoring",
    simple: "Tests or checks done while a person is on the medicine.",
    medical:
      "Scheduled clinical or laboratory assessment for efficacy and toxicity during therapy.",
    hinglish: "Medicine lene ke dauraan jo tests ya checks kiye jaate hain.",
    hindi: "दवा लेते समय किए जाने वाले परीक्षण या जाँच।",
  }),
  counselling: e({
    term: "Counselling",
    simple: "Practical advice given to the patient about taking the medicine safely.",
    medical:
      "Structured patient education covering administration, adherence, warning signs and storage.",
    hinglish: "Patient ko medicine safely lene ke baare mein di gayi practical advice.",
    hindi: "रोगी को दवा सुरक्षित रूप से लेने की व्यावहारिक सलाह।",
  }),
  absorption: e({
    term: "Absorption",
    simple: "How the medicine gets from the site of intake into the blood.",
    medical: "Movement of drug from the administration site into systemic circulation.",
    hinglish: "Medicine intake ki jagah se blood tak kaise pahunchti hai.",
    hindi: "दवा शरीर में लेने की जगह से रक्त तक कैसे पहुँचती है।",
    related: ["ADME", "Bioavailability"],
  }),
  distribution: e({
    term: "Distribution",
    simple: "How the medicine spreads from blood into body tissues.",
    medical: "Reversible transfer of drug from the bloodstream into tissues and body compartments.",
    hinglish: "Medicine blood se body tissues mein kaise failti hai.",
    hindi: "दवा रक्त से शरीर के ऊतकों में कैसे फैलती है।",
    related: ["Volume of Distribution", "Protein Binding"],
  }),
  metabolism: e({
    term: "Metabolism",
    simple: "How the body chemically changes the medicine, mostly in the liver.",
    medical:
      "Biotransformation, largely hepatic (phase I oxidation via CYP450, phase II conjugation), into metabolites.",
    hinglish: "Body medicine ko chemically kaise badalti hai, mostly liver mein.",
    hindi: "शरीर दवा को रासायनिक रूप से कैसे बदलता है, मुख्यतः लिवर में।",
    related: ["Hepatic", "Prodrug", "Enzyme Inhibitor"],
  }),
  excretion: e({
    term: "Excretion",
    simple: "How the medicine leaves the body, mostly through urine or stool.",
    medical: "Irreversible removal of drug and metabolites, chiefly renal and biliary.",
    hinglish: "Medicine body se kaise bahar jaati hai, mostly urine ya stool ke through.",
    hindi: "दवा शरीर से कैसे बाहर निकलती है।",
    related: ["Renal", "Clearance"],
  }),
  salt: e({
    term: "Salt / Active Ingredient",
    simple: "The actual chemical that produces the medicine's effect.",
    medical:
      "The pharmacologically active moiety, often paired with a counter-ion to improve solubility or stability.",
    hinglish: "Wo actual chemical jo medicine ka effect deta hai.",
    hindi: "वह वास्तविक रसायन जो दवा का असर देता है।",
  }),
  "verification status": e({
    term: "Verification Status",
    simple: "Whether the record has been checked against a reliable reference.",
    medical: "Editorial state of a data record: verified, needs review or unverified.",
    hinglish: "Record kisi reliable reference se check kiya gaya hai ya nahi.",
    hindi: "क्या रिकॉर्ड किसी विश्वसनीय संदर्भ से जाँचा गया है।",
  }),
  agonist: e({
    term: "Agonist",
    simple: "A drug that switches a receptor on and produces a response.",
    medical: "A ligand that binds a receptor and produces the full biological response.",
    hinglish: "Aisi drug jo receptor ko activate karke response deti hai.",
    hindi: "ऐसी दवा जो रिसेप्टर को सक्रिय करके प्रभाव देती है।",
    examples: ["Salbutamol at beta-2 receptors"],
    related: ["Antagonist", "Partial Agonist", "Receptor"],
  }),
  antagonist: e({
    term: "Antagonist",
    simple: "A drug that blocks a receptor so the natural signal cannot act.",
    medical:
      "A ligand that binds a receptor without activating it, preventing agonist-mediated response.",
    hinglish: "Aisi drug jo receptor ko block karti hai, response nahi deti.",
    hindi: "ऐसी दवा जो रिसेप्टर को अवरुद्ध करती है।",
    examples: ["Propranolol at beta receptors"],
    related: ["Agonist", "Receptor"],
  }),
  "partial agonist": e({
    term: "Partial Agonist",
    simple: "A drug that switches a receptor on only partly, even at full dose.",
    medical: "A ligand with submaximal intrinsic activity relative to a full agonist.",
    hinglish: "Aisi drug jo receptor ko poori tarah nahi, thoda hi activate karti hai.",
    hindi: "ऐसी दवा जो रिसेप्टर को आंशिक रूप से सक्रिय करती है।",
    related: ["Agonist", "Antagonist"],
  }),
  receptor: e({
    term: "Receptor",
    simple: "A target on or inside a cell that a medicine attaches to.",
    medical:
      "A macromolecule that binds a ligand and transduces a signal, e.g. GPCR, ion channel, nuclear receptor.",
    hinglish: "Cell par ya andar ka target jahan medicine attach hoti hai.",
    hindi: "कोशिका पर या भीतर वह लक्ष्य जहाँ दवा जुड़ती है।",
    related: ["Agonist", "Antagonist", "Mechanism of Action"],
  }),
  "enzyme inhibitor": e({
    term: "Enzyme Inhibitor",
    simple: "A medicine that slows or blocks an enzyme.",
    medical:
      "A drug that reduces enzyme activity competitively, non-competitively or irreversibly.",
    hinglish: "Aisi medicine jo kisi enzyme ka kaam rok deti hai.",
    hindi: "ऐसी दवा जो किसी एंजाइम के कार्य को रोकती है।",
    examples: ["ACE inhibitors", "Statins (HMG-CoA reductase)"],
    related: ["Mechanism of Action", "Metabolism"],
  }),
  prodrug: e({
    term: "Prodrug",
    simple: "An inactive medicine that the body converts into the active form.",
    medical:
      "A pharmacologically inactive compound metabolised in vivo into the active drug moiety.",
    hinglish: "Aisi inactive medicine jo body mein active form mein badal jaati hai.",
    hindi: "ऐसी निष्क्रिय दवा जो शरीर में सक्रिय रूप में बदल जाती है।",
    examples: ["Enalapril → enalaprilat"],
    related: ["Metabolism"],
  }),
  tolerance: e({
    term: "Tolerance",
    simple: "The medicine works less well over time, so more is needed for the same effect.",
    medical: "Reduced pharmacological response after repeated exposure, requiring dose escalation.",
    hinglish: "Time ke saath medicine ka asar kam ho jaana.",
    hindi: "समय के साथ दवा का असर कम हो जाना।",
    related: ["Dependence"],
  }),
  dependence: e({
    term: "Dependence",
    simple: "The body or mind needs the medicine to function normally.",
    medical:
      "An adaptive state in which withdrawal symptoms appear when the drug is stopped or reduced.",
    hinglish: "Body ya mind ko medicine ki aadat pad jaana.",
    hindi: "शरीर या मन का दवा पर निर्भर हो जाना।",
    related: ["Tolerance"],
  }),
  resistance: e({
    term: "Resistance",
    simple: "Germs stop responding to a medicine that used to kill them.",
    medical:
      "Loss of susceptibility of a microorganism or cell line to a previously effective agent.",
    hinglish: "Bacteria ya germs par medicine ka asar khatam ho jaana.",
    hindi: "रोगाणुओं पर दवा का असर समाप्त हो जाना।",
    related: ["Antibiotics"],
  }),
  "first pass metabolism": e({
    term: "First-Pass Metabolism",
    simple: "The liver breaks down part of an oral medicine before it reaches the blood.",
    medical:
      "Presystemic hepatic and gut-wall metabolism that reduces the bioavailability of orally administered drugs.",
    hinglish: "Oral medicine ka kuch hissa liver pehle hi tod deta hai.",
    hindi: "मुँह से ली गई दवा का कुछ भाग लिवर पहले ही तोड़ देता है।",
    related: ["Bioavailability", "Metabolism"],
  }),
  "therapeutic index": e({
    term: "Therapeutic Index",
    simple: "How wide the safety gap is between a helpful dose and a harmful dose.",
    medical: "Ratio of the toxic dose to the effective dose; a narrow index needs close monitoring.",
    hinglish: "Effective dose aur toxic dose ke beech ka safety gap.",
    hindi: "प्रभावी और विषैली खुराक के बीच सुरक्षा का अंतर।",
    related: ["Monitoring"],
  }),
  "loading dose": e({
    term: "Loading Dose",
    simple: "A larger first dose used to reach the working level quickly.",
    medical:
      "An initial higher dose calculated from volume of distribution to rapidly attain target concentration.",
    hinglish: "Pehli badi dose taaki level jaldi ban jaye.",
    hindi: "शुरुआती बड़ी खुराक ताकि स्तर जल्दी बने।",
    related: ["Volume of Distribution"],
  }),
  "steady state": e({
    term: "Steady State",
    simple: "When the amount going in equals the amount leaving, so levels stay stable.",
    medical:
      "Condition where rate of drug administration equals rate of elimination, reached in ~4–5 half-lives.",
    hinglish: "Jab medicine ka intake aur elimination barabar ho jaata hai.",
    hindi: "जब दवा का सेवन और निष्कासन बराबर हो जाता है।",
    related: ["Half-life"],
  }),
};

/** Alternate spellings and plurals mapped to canonical glossary keys. */
const ALIASES: Record<string, string> = {
  interactions: "drug interactions",
  interaction: "drug interactions",
  "drug interaction": "drug interactions",
  indications: "indication",
  "adverse effect": "adverse effects",
  "common adverse effects": "adverse effects",
  "serious adverse effects": "adverse effects",
  "side effects": "side effect",
  contraindication: "contraindications",
  precaution: "precautions",
  warning: "warnings",
  "half life": "half-life",
  halflife: "half-life",
  "active ingredient": "salt",
  "patient counselling": "counselling",
  counseling: "counselling",
  "route": "route of administration",
  routes: "route of administration",
  "first-pass metabolism": "first pass metabolism",
  "steady-state": "steady state",
  "mechanism": "mechanism of action",
  moa: "mechanism of action",
};

export function lookupTerm(term: string): GlossaryEntry | undefined {
  const key = term.trim().toLowerCase();
  return GLOSSARY[key] ?? GLOSSARY[ALIASES[key] ?? ""];
}

export const GLOSSARY_TERMS = Object.values(GLOSSARY).sort((a, b) => a.term.localeCompare(b.term));
