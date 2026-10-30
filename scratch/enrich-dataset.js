const fs = require('fs');
const path = require('path');

// Read existing dataset to preserve all IDs, categories, and original problem associations
const rootDir = path.join(__dirname, '..');
const existingData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'medicines-reference.json'), 'utf8'));

// Verified clinical profiles mapping by medicine name
const CLINICAL_PROFILES = {
  "Paracetamol": {
    generic_name: "Acetaminophen / Paracetamol",
    nlem_reference: "NLEM 2022 Section 2.1.5, 5.2.3, 27.4 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 2.1",
    strengths_available: [
      "Tablet: 500 mg, 650 mg",
      "Oral Liquid / Syrup: 120 mg/5 mL (pediatric), 125 mg/5 mL (pediatric), 250 mg/5 mL (pediatric)",
      "Injection: 150 mg/mL (IV infusion / IM)",
      "Suppository: 80 mg, 170 mg"
    ],
    common_uses: [
      "Pyrexia (fever) reduction in viral and bacterial illnesses",
      "Somatic and musculoskeletal mild-to-moderate pain",
      "Tension headaches and migraine adjunct therapy",
      "Dental pain and post-vaccination fever"
    ],
    dosage_by_age: {
      children: "Weight-based dosing: 10–15 mg/kg per dose every 4–6 hours as needed; maximum 4 doses (60 mg/kg) in 24 hours. Always use calibrated pediatric oral measuring syringe or cup with oral suspension (120 mg/5 mL or 250 mg/5 mL). Never administer adult tablets to young infants without explicit pediatric calculation.",
      adults: "500 mg to 1,000 mg orally every 4 to 6 hours as needed for fever or pain. Minimum dosing interval: 4 hours. Do not exceed 4,000 mg (4 g) in any 24-hour window.",
      elderly: "Standard adult dosing (500–1,000 mg every 4–6 hours). In frail elderly individuals, low body weight (<50 kg), or mild hepatic/renal compromise, a conservative ceiling of 2,000–3,000 mg/24h is recommended."
    },
    max_recommended_dose: "4,000 mg (4 g) per 24 hours for adults; 60 mg/kg/day for pediatric patients (not to exceed adult maximum).",
    side_effects: [
      "Rare at therapeutic doses: nausea, pruritus, allergic skin rash",
      "Very rare: thrombocytopenia, leukopenia, neutropenia",
      "Overdose / Toxic ingestions: severe acute hepatic necrosis, acute liver failure, renal tubular necrosis"
    ],
    precautions_contraindications: "Strictly contraindicated in severe active hepatic failure or acute liver disease. Caution in chronic alcohol dependence, severe renal impairment, chronic malnutrition, and G6PD deficiency. Critical Warning: Avoid combining with other paracetamol-containing combination medicines (e.g., OTC cold/cough syrups) to prevent accidental hepatotoxic overdose.",
    clinical_warning: "Dosage depends on age, weight, formulation, liver health, kidney function, and other concurrent medicines. Do not self-medicate or exceed the stated dose. Consult a licensed healthcare provider."
  },
  "Ibuprofen": {
    generic_name: "Ibuprofen",
    nlem_reference: "NLEM 2022 Section 2.1.3, 5.2.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 2.1 & 7.1",
    strengths_available: [
      "Tablet: 200 mg, 400 mg",
      "Oral Liquid: 100 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Inflammatory pain and joint stiffness in rheumatoid arthritis & osteoarthritis",
      "Acute soft tissue injuries, sprains, strains, and dental inflammation",
      "Acute mild-to-moderate migraine attack abortion",
      "Fever in children when paracetamol is insufficient"
    ],
    dosage_by_age: {
      children: "Pediatric suspension (100 mg/5 mL): 5–10 mg/kg per dose orally every 6–8 hours as needed; maximum 30–40 mg/kg/day. Not recommended in infants under 3 months or weighing less than 5 kg without specialist supervision.",
      adults: "200 mg to 400 mg orally every 4 to 6 hours as needed with or after food. Under medical supervision for inflammatory disorders: 400–600 mg every 6–8 hours.",
      elderly: "Use the lowest effective dose for the shortest duration. Elderly patients are at significantly higher risk for gastrointestinal ulceration/bleeding and renal hemodynamic compromise."
    },
    max_recommended_dose: "1,200 mg/24h for OTC self-care; up to 2,400 mg/24h under direct physician supervision.",
    side_effects: [
      "Dyspepsia, heartburn, epigastric discomfort, nausea",
      "Gastrointestinal ulceration, occult bleeding, fluid retention",
      "Hypertension exacerbation, elevated serum creatinine, headache"
    ],
    precautions_contraindications: "Contraindicated in active peptic ulcer, severe heart failure (NYHA Class IV), advanced renal impairment, and history of aspirin/NSAID-induced asthma. Always administer with food or milk to minimize gastric mucosal irritation.",
    clinical_warning: "Dosage depends on age, weight, cardiovascular risk, and gastrointestinal history. Do not use continuously without clinical review."
  },
  "Morphine": {
    generic_name: "Morphine Sulphate",
    nlem_reference: "NLEM 2022 Section 1.3.4, 2.2.2, 7.4.13 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 2.2",
    strengths_available: [
      "Tablet: 10 mg",
      "Modified Release Tablet: 30 mg",
      "Injection: 10 mg/mL, 15 mg/mL"
    ],
    common_uses: [
      "Severe acute somatic and visceral pain (major trauma, surgical procedures, myocardial infarction)",
      "Chronic cancer pain and advanced palliative end-of-life care",
      "Acute pulmonary edema adjunct in intensive care"
    ],
    dosage_by_age: {
      children: "Strictly administered under specialist pediatric hospital inpatient protocol (0.1–0.2 mg/kg per dose orally or IV) with continuous pulse oximetry and respiratory monitoring.",
      adults: "Immediate-release oral: 5–10 mg every 4 hours initially for opioid-naive patients, titrated individually by palliative or pain specialists; IV: 2–5 mg slow titration.",
      elderly: "Require lower starting doses (e.g. 2.5–5 mg) and longer dosing intervals due to reduced renal excretion, high sensitivity to central sedation, and fall risk."
    },
    max_recommended_dose: "No arbitrary ceiling for opioid-tolerant cancer pain; strictly titrated against pain severity and respiratory rate under continuous medical supervision.",
    side_effects: [
      "Drowsiness, sedation, dizziness, confusion",
      "Constipation (nearly universal; requires co-prescribed laxatives), nausea, vomiting",
      "Respiratory depression, hypotension, physical dependence, tolerance"
    ],
    precautions_contraindications: "Strictly contraindicated in acute severe respiratory depression, paralytic ileus, severe chronic obstructive pulmonary disease, and head injury with raised intracranial pressure. Strictly controlled narcotic formulation (Schedule X / NDPS).",
    clinical_warning: "STRICT MEDICAL SUPERVISION REQUIRED. High risk of dependence and life-threatening respiratory depression. Strictly prohibited without verified specialist prescription."
  },
  "Omeprazole": {
    generic_name: "Omeprazole",
    nlem_reference: "NLEM 2022 Section 17.1.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 17.1",
    strengths_available: [
      "Capsule: 10 mg, 20 mg, 40 mg",
      "Powder for Oral Liquid: 20 mg"
    ],
    common_uses: [
      "Gastro-oesophageal reflux disease (GERD) and erosive esophagitis",
      "Treatment and prophylaxis of gastric and duodenal peptic ulcers",
      "Eradication of Helicobacter pylori (triple therapy regimens)",
      "Prophylaxis of NSAID-induced gastric ulceration"
    ],
    dosage_by_age: {
      children: "Pediatric GERD / erosive esophagitis: 0.7–1.4 mg/kg once daily (10–20 mg) under pediatric specialist supervision.",
      adults: "20 mg to 40 mg once daily taken 30–60 minutes before morning breakfast. H. pylori eradication: 20 mg twice daily with antibiotics for 14 days.",
      elderly: "Standard adult dose of 20 mg once daily. Long-term unmonitored use requires monitoring of bone density, magnesium, and vitamin B12."
    },
    max_recommended_dose: "40 mg/day for standard GERD/ulcer therapy; up to 80–120 mg/day in hypersecretory conditions (Zollinger-Ellison).",
    side_effects: [
      "Headache, abdominal pain, diarrhea, constipation, nausea, flatulence",
      "Long-term use: hypomagnesemia, Vitamin B12 deficiency, increased risk of Clostridioides difficile enteritis"
    ],
    precautions_contraindications: "Exclude gastric malignancy before initiating long-term therapy as omeprazole may mask symptoms. Potential interaction with clopidogrel (CYP2C19 inhibition). Swallow capsules whole; do not crush.",
    clinical_warning: "Do not use continuously for prolonged periods without medical evaluation of persistent heartburn or dysphagia."
  },
  "Ondansetron": {
    generic_name: "Ondansetron",
    nlem_reference: "NLEM 2022 Section 7.4.14, 17.2.3 • Healthcare Level: S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 17.2",
    strengths_available: [
      "Tablet: 4 mg, 8 mg",
      "Oral Liquid: 2 mg/5 mL (pediatric)",
      "Injection: 2 mg/mL"
    ],
    common_uses: [
      "Prevention and management of chemotherapy-induced nausea and vomiting (CINV)",
      "Prevention and treatment of post-operative nausea and vomiting (PONV)",
      "Radiotherapy-induced emesis",
      "Acute pediatric viral gastroenteritis-associated emesis under clinical protocol"
    ],
    dosage_by_age: {
      children: "Oral solution: 0.15 mg/kg per dose (or 2 mg for 8–15 kg, 4 mg for >15 kg) up to 3 times daily under clinical direction.",
      adults: "4 mg to 8 mg orally every 8 hours as needed. Pre-chemotherapy: 8 mg to 16 mg IV/oral prior to treatment.",
      elderly: "Standard adult dosage. In hepatic impairment (Child-Pugh C): maximum daily dose is 8 mg."
    },
    max_recommended_dose: "16 mg per single IV dose; 24 mg per day orally in divided doses.",
    side_effects: [
      "Headache, constipation, sensation of warmth or flushing",
      "Transient asymptomatic ECG changes (dose-dependent QT prolongation)"
    ],
    precautions_contraindications: "Contraindicated in congenital long QT syndrome. Caution with concurrent QT-prolonging medicines or electrolyte imbalances (hypokalemia, hypomagnesemia). Maximum 8 mg/day in severe hepatic impairment.",
    clinical_warning: "Dose must be determined by clinical condition and route of administration. Monitor cardiac status in high-risk patients."
  },
  "Metoclopramide": {
    generic_name: "Metoclopramide Hydrochloride",
    nlem_reference: "NLEM 2022 Section 7.4.10, 17.2.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 17.2",
    strengths_available: [
      "Tablet: 10 mg",
      "Oral Liquid: 5 mg/5 mL (pediatric)",
      "Injection: 5 mg/mL"
    ],
    common_uses: [
      "Nausea and vomiting induced by migraine or gastrointestinal motility disorders",
      "Diabetic gastroparesis and delayed gastric emptying",
      "Gastrointestinal radiological transit facilitator"
    ],
    dosage_by_age: {
      children: "Contraindicated in infants under 1 year. Children 1–18 years: 0.1 to 0.15 mg/kg body weight per dose, maximum 3 times daily. Secondary option only due to neurological risks.",
      adults: "10 mg orally or IV/IM up to 3 times daily. Maximum recommended treatment duration is 5 consecutive days.",
      elderly: "Dose reduction recommended due to high risk of extrapyramidal symptoms, parkinsonism, and irreversible tardive dyskinesia."
    },
    max_recommended_dose: "30 mg per 24 hours (or 0.5 mg/kg/day).",
    side_effects: [
      "Drowsiness, restlessness, lassitude",
      "Extrapyramidal reactions (acute dystonia, oculogyric crisis, facial spasm)",
      "Tardive dyskinesia with prolonged use, hyperprolactinemia"
    ],
    precautions_contraindications: "Contraindicated in gastrointestinal hemorrhage, mechanical obstruction, perforation, and pheochromocytoma. Strictly avoid long-term therapy (>5 days).",
    clinical_warning: "Risk of neurological movement disorders. Must be used at lowest effective dose for no more than 5 days."
  },
  "Oral Rehydration Salts (ORS)": {
    generic_name: "Oral Rehydration Salts (WHO Low-Osmolarity Formula)",
    nlem_reference: "NLEM 2022 Section 17.6.1, 25.1.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 17.6 & 25.1",
    strengths_available: [
      "Powder for Solution: WHO Formulation (NaCl 2.6g, Dextrose 13.5g, KCl 1.5g, Trisodium Citrate 2.9g per liter)"
    ],
    common_uses: [
      "Prevention and treatment of acute dehydration from viral/bacterial diarrhea",
      "Replacement of electrolyte and fluid losses in cholera and gastroenteritis"
    ],
    dosage_by_age: {
      children: "Children <2 years: 50–100 mL after each loose stool. Children 2–10 years: 100–200 mL after each loose stool. Continue normal feeding and breast milk.",
      adults: "200–400 mL after each loose stool, or ad libitum (2 to 3 liters/day based on thirst and ongoing fluid losses).",
      elderly: "Administer in frequent small sips. Monitor carefully in patients with heart failure or chronic kidney disease to prevent fluid overload."
    },
    max_recommended_dose: "Titrated to match fluid and electrolyte deficit; no arbitrary maximum, but adjust in renal compromise.",
    side_effects: [
      "Vomiting if consumed too rapidly (pause 10 minutes, then resume in sips)",
      "Hypernatremia if incorrectly dissolved in insufficient water"
    ],
    precautions_contraindications: "CRITICAL: Reconstitute strictly in exactly 1 Liter of clean drinking water. Do not mix with milk, juice, or additional sugar. Severe shock or unconsciousness requires IV fluids.",
    clinical_warning: "Preparation volume accuracy is essential. Seek emergency care if child cannot drink, is lethargic, or has sunken eyes."
  },
  "Lactulose": {
    generic_name: "Lactulose",
    nlem_reference: "NLEM 2022 Section 7.4.8, 17.5.3 • Healthcare Level: S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 17.5",
    strengths_available: [
      "Oral Liquid: 10 g/15 mL"
    ],
    common_uses: [
      "Chronic functional and opioid-induced constipation",
      "Hepatic encephalopathy treatment and prevention (ammonia reduction)"
    ],
    dosage_by_age: {
      children: "1 month–1 year: 2.5 mL twice daily; 1–6 years: 5 mL twice daily; 7–14 years: 10 mL twice daily.",
      adults: "Constipation: 15–30 mL once or twice daily. Hepatic encephalopathy: 30–50 mL 3 times daily titrated to produce 2–3 soft stools/day.",
      elderly: "Standard adult dose (15–30 mL daily). Ensure adequate hydration to prevent dehydration."
    },
    max_recommended_dose: "45 mL/day for constipation; 90–150 mL/day for hepatic encephalopathy.",
    side_effects: [
      "Abdominal distension, flatulence, cramping, nausea, diarrhea with excessive dose"
    ],
    precautions_contraindications: "Contraindicated in galactosemia and intestinal obstruction. Caution in diabetics (contains free galactose and lactose).",
    clinical_warning: "May take 24–48 hours to produce laxative effect. Maintain adequate daily fluid intake."
  },
  "Albendazole": {
    generic_name: "Albendazole",
    nlem_reference: "NLEM 2022 Section 6.1.1.1, 6.1.2.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.1",
    strengths_available: [
      "Tablet: 400 mg",
      "Chewable Tablet: 400 mg",
      "Oral Liquid: 200 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Intestinal nematode infections (Ascaris lumbricoides, Enterobius, hookworm)",
      "Neurocysticercosis and Echinococcus hydatid cyst disease"
    ],
    dosage_by_age: {
      children: "Children 1–2 years: 200 mg single dose. Children >2 years: 400 mg single dose. Not recommended in infants under 1 year.",
      adults: "400 mg as a single oral dose for intestinal worms; repeat in 2 weeks for enterobiasis. Hydatid disease: 400 mg twice daily for 28-day cycles with food.",
      elderly: "Standard adult dose for intestinal deworming. Monitor hepatic enzymes during prolonged tissue therapy."
    },
    max_recommended_dose: "400 mg single dose for deworming; 800 mg/day divided for systemic tissue parasitic infections.",
    side_effects: [
      "Abdominal pain, nausea, vomiting, dizziness, headache",
      "Reversible elevation of hepatic enzymes; leukopenia with prolonged high-dose therapy"
    ],
    precautions_contraindications: "STRICTLY CONTRAINDICATED IN PREGNANCY (teratogenic in 1st trimester). Take with fatty meal to enhance absorption when treating systemic parasites.",
    clinical_warning: "Verify pregnancy status before administration in women of childbearing potential. Repeat deworming after 14 days if recommended."
  },
  "Clotrimazole": {
    generic_name: "Clotrimazole",
    nlem_reference: "NLEM 2022 Section 6.5.2, 6.7.5.4, 11.1.1, 16.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.5 & 11.1",
    strengths_available: [
      "Cream: 1%",
      "Lotion: 1%",
      "Ear Drops: 1%",
      "Pessary (Vaginal Tablet): 100 mg",
      "Ointment: 1%"
    ],
    common_uses: [
      "Dermatophytosis (Tinea pedis / athlete's foot, Tinea cruris / jock itch, Tinea corporis)",
      "Cutaneous candidiasis and candidal diaper rash",
      "Vulvovaginal candidiasis (yeast infection)",
      "Otomycosis (fungal ear infections)"
    ],
    dosage_by_age: {
      children: "Topical cream 1%: apply thinly to affected area 2 times daily for children >2 years under adult supervision.",
      adults: "Topical: apply 2–3 times daily for 2–4 weeks. Vaginal pessary: 100 mg inserted nightly for 6 consecutive days.",
      elderly: "Standard topical application."
    },
    max_recommended_dose: "Topical and vaginal formulation; systemic absorption is clinically negligible (<0.5%).",
    side_effects: [
      "Local skin irritation, burning, erythema, mild stinging, peeling"
    ],
    precautions_contraindications: "For topical/vaginal use only. Do not apply near eyes. Continue treatment for 1–2 weeks after symptoms resolve to prevent recurrence.",
    clinical_warning: "If skin irritation or sensitization develops, discontinue use and consult a healthcare provider."
  },
  "Miconazole": {
    generic_name: "Miconazole Nitrate",
    nlem_reference: "NLEM 2022 Section 11.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 11.1",
    strengths_available: [
      "Cream / Ointment: 2%",
      "Oral Gel: 24 mg/mL"
    ],
    common_uses: [
      "Cutaneous dermatophyte infections and superficial candidiasis",
      "Oropharyngeal candidiasis (oral thrush)"
    ],
    dosage_by_age: {
      children: "Oral gel: small portion applied with clean finger to oral lesions 4 times daily after feeds in infants >4 months.",
      adults: "Topical cream 2%: apply thinly to cleansed affected area twice daily for 2–4 weeks.",
      elderly: "Standard topical application. Oral gel caution: potential drug interaction with oral anticoagulants."
    },
    max_recommended_dose: "Topical application as directed.",
    side_effects: [
      "Local burning, contact dermatitis, itching"
    ],
    precautions_contraindications: "Oral gel inhibits CYP2C9 and may severely augment warfarin anticoagulation. Topical forms should not contact eyes.",
    clinical_warning: "Ensure complete course of therapy to prevent relapse."
  },
  "Mupirocin": {
    generic_name: "Mupirocin",
    nlem_reference: "NLEM 2022 Section 6.5.6 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.5",
    strengths_available: [
      "Ointment: 2%"
    ],
    common_uses: [
      "Impetigo and superficial bacterial skin infections caused by Staph and Strep",
      "Eradication of nasal methicillin-resistant Staphylococcus aureus (MRSA)"
    ],
    dosage_by_age: {
      children: "Apply small amount to affected area up to 3 times daily in infants >2 months.",
      adults: "Apply small amount to affected area 2 to 3 times daily for up to 10 days. May cover with sterile dressing.",
      elderly: "Standard application. Avoid large surface area application if renal impairment."
    },
    max_recommended_dose: "Do not exceed 10 consecutive treatment days to minimize emergence of resistant strains.",
    side_effects: [
      "Local burning, stinging, itching, erythema at site of application"
    ],
    precautions_contraindications: "Not for ophthalmic use. Contains polyethylene glycol; avoid on extensive open wounds in renal impairment.",
    clinical_warning: "Limit treatment duration to 10 days to preserve antibacterial efficacy."
  },
  "Amoxicillin": {
    generic_name: "Amoxicillin",
    nlem_reference: "NLEM 2022 Section 6.2.1.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2",
    strengths_available: [
      "Capsule: 250 mg, 500 mg",
      "Oral Liquid: 125 mg/5 mL (pediatric), 250 mg/5 mL (pediatric)",
      "Powder for Injection: 250 mg, 500 mg, 1,000 mg"
    ],
    common_uses: [
      "Acute bacterial otitis media and streptococcal tonsillopharyngitis",
      "Community-acquired bacterial pneumonia and lower respiratory infections",
      "Acute bacterial sinusitis, dental infections, and uncomplicated cystitis"
    ],
    dosage_by_age: {
      children: "Oral suspension: 20–40 mg/kg/day divided every 8 hours (or 40–90 mg/kg/day divided every 12 hours for severe otitis/pneumonia) as prescribed by pediatrician.",
      adults: "250 mg to 500 mg orally every 8 hours, or 500 mg to 875 mg every 12 hours. Severe infections: up to 1,000 mg every 8 hours.",
      elderly: "Standard adult dose; reduce dosing frequency in moderate-to-severe renal impairment (GFR <30 mL/min)."
    },
    max_recommended_dose: "3,000 mg (3 g) per day orally in adults; 90 mg/kg/day in children.",
    side_effects: [
      "Diarrhea, nausea, vomiting, erythematous skin rash",
      "Antibiotic-associated colitis, oral and vaginal candidiasis"
    ],
    precautions_contraindications: "STRICTLY CONTRAINDICATED in patients with verified penicillin or beta-lactam anaphylaxis history. High incidence of rash in infectious mononucleosis.",
    clinical_warning: "Antibiotic prescription required. Complete the full prescribed course even if symptoms resolve earlier to prevent bacterial resistance."
  },
  "Azithromycin": {
    generic_name: "Azithromycin",
    nlem_reference: "NLEM 2022 Section 6.2.2.1, 6.7.6.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2",
    strengths_available: [
      "Tablet: 250 mg, 500 mg, 1,000 mg",
      "Oral Liquid: 200 mg/5 mL (pediatric)",
      "Powder for Injection: 500 mg"
    ],
    common_uses: [
      "Community-acquired atypical pneumonia and acute bacterial bronchitis",
      "Chlamydia trachomatis genital infections and enteric fever (typhoid)"
    ],
    dosage_by_age: {
      children: "Oral liquid: 10 mg/kg once daily on Day 1, followed by 5 mg/kg once daily on Days 2–5.",
      adults: "Respiratory: 500 mg once daily on Day 1, then 250 mg once daily on Days 2–5 (or 500 mg daily for 3 days). STI (Chlamydia): 1,000 mg single dose.",
      elderly: "Standard adult dose. Screen for baseline QT interval prolongation and cardiac arrhythmias."
    },
    max_recommended_dose: "500 mg/day for multi-day respiratory protocols; 1,000–2,000 mg single dose for specific STI regimens.",
    side_effects: [
      "Diarrhea, abdominal cramps, nausea, vomiting, headache, dizziness, QT prolongation"
    ],
    precautions_contraindications: "Contraindicated in patients with cholestatic jaundice/hepatic dysfunction associated with prior macrolide use. Caution in arrhythmias and electrolyte imbalance.",
    clinical_warning: "Prescription antibiotic. Take on an empty stomach or with light food if GI upset occurs."
  },
  "Doxycycline": {
    generic_name: "Doxycycline",
    nlem_reference: "NLEM 2022 Section 6.2.2.7, 6.10.2.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2",
    strengths_available: [
      "Capsule / Tablet: 100 mg",
      "Dry Syrup: 50 mg/5 mL (pediatric)",
      "Powder for Injection: 100 mg"
    ],
    common_uses: [
      "Rickettsial diseases (scrub typhus, spotted fevers)",
      "Atypical pneumonia, chlamydial urethritis, moderate-to-severe inflammatory acne",
      "Malaria chemoprophylaxis for travelers"
    ],
    dosage_by_age: {
      children: "CONTRAINDICATED in children under 8 years due to permanent tooth staining and enamel hypoplasia (except in life-threatening rickettsial infections).",
      adults: "200 mg on day 1 (100 mg every 12 hours), followed by 100 mg once daily with meals and full glass of water.",
      elderly: "Standard adult dosage. Safe in renal impairment (eliminated via biliary route)."
    },
    max_recommended_dose: "200 mg per 24 hours.",
    side_effects: [
      "Epigastric distress, esophageal ulceration (if taken recumbent), cutaneous photosensitivity"
    ],
    precautions_contraindications: "Strictly contraindicated in pregnancy, breastfeeding, and children under 8 years. Take with large glass of water while upright and remain upright for 30 minutes.",
    clinical_warning: "Avoid sun exposure due to photosensitivity risk. Ingest while standing with ample water."
  },
  "Nitrofurantoin": {
    generic_name: "Nitrofurantoin",
    nlem_reference: "NLEM 2022 Section 6.2.2.10 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2",
    strengths_available: [
      "Tablet: 100 mg",
      "Oral Liquid: 25 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Treatment of uncomplicated acute lower urinary tract infections (cystitis)",
      "Long-term prophylaxis of recurrent urinary tract infections"
    ],
    dosage_by_age: {
      children: "Infants >3 months: 3–5 mg/kg/day divided in 4 doses with food. Contraindicated in infants <1 month.",
      adults: "Macrobid formulation: 100 mg orally twice daily for 5 days with food. Monohydrate: 50–100 mg 4 times daily for 7 days.",
      elderly: "Contraindicated if eGFR <45 mL/min due to poor urinary concentration and high risk of neuro/pulmonary toxicity."
    },
    max_recommended_dose: "400 mg per 24 hours.",
    side_effects: [
      "Dark yellow/brown urine discoloration (benign), nausea, headache, peripheral neuropathy"
    ],
    precautions_contraindications: "Contraindicated in severe renal impairment (eGFR <45 mL/min), G6PD deficiency, and term pregnancy (weeks 38–42).",
    clinical_warning: "Not indicated for upper tract kidney infections (pyelonephritis). Take with meals."
  },
  "Metronidazole": {
    generic_name: "Metronidazole",
    nlem_reference: "NLEM 2022 Section 6.2.2.9, 6.9.1.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2 & 6.9",
    strengths_available: [
      "Tablet: 200 mg, 400 mg",
      "Oral Liquid: 200 mg/5 mL (pediatric)",
      "Injection: 500 mg/100 mL"
    ],
    common_uses: [
      "Intestinal and hepatic amoebiasis (Entamoeba histolytica)",
      "Giardiasis, trichomoniasis, and bacterial vaginosis",
      "Anaerobic bacterial intra-abdominal, pelvic, and dental infections"
    ],
    dosage_by_age: {
      children: "Amoebiasis: 35–50 mg/kg/day divided in 3 doses for 7–10 days. Giardiasis: 15 mg/kg/day for 5 days.",
      adults: "Amoebic dysentery: 400–800 mg 3 times daily for 7–10 days. Trichomoniasis: 2 g single dose or 400 mg twice daily for 7 days.",
      elderly: "Standard adult dose; reduce dose by 50% in severe hepatic failure."
    },
    max_recommended_dose: "2,400 mg/24h for oral therapy.",
    side_effects: [
      "Unpleasant metallic taste, dark reddish-brown urine, nausea, anorexia, peripheral neuropathy with prolonged therapy"
    ],
    precautions_contraindications: "ABSOLUTELY AVOID ALCOHOL during therapy and for 48 hours after (disulfiram-like severe reaction). History of active neurological disorders.",
    clinical_warning: "Strict abstinence from alcohol required during treatment to prevent severe nausea, flushing, and tachycardia."
  },
  "Cefalexin": {
    generic_name: "Cefalexin (Cephalexin)",
    nlem_reference: "WHO Model List of Essential Medicines (2025) Section 6.2.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.2.1",
    strengths_available: [
      "Capsule / Tablet: 250 mg, 500 mg",
      "Oral Liquid: 125 mg/5 mL (pediatric), 250 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Bacterial skin and soft tissue infections (cellulitis, folliculitis)",
      "Streptococcal pharyngitis, mild otitis media, uncomplicated urinary infections"
    ],
    dosage_by_age: {
      children: "25–50 mg/kg/day divided every 6 to 12 hours (up to 100 mg/kg/day in severe skin infections).",
      adults: "250 mg to 500 mg orally every 6 hours, or 500 mg every 12 hours for 7–14 days.",
      elderly: "Standard adult dose; adjust interval in severe renal failure."
    },
    max_recommended_dose: "4,000 mg (4 g) per 24 hours.",
    side_effects: [
      "Diarrhea, nausea, dyspepsia, mild allergic rash"
    ],
    precautions_contraindications: "Cephalosporin allergy or severe immediate penicillin anaphylaxis history. Complete the prescribed course.",
    clinical_warning: "Antibiotic requiring verified medical diagnosis."
  },
  "Isoniazid": {
    generic_name: "Isoniazid (INH)",
    nlem_reference: "NLEM 2022 Section 6.4.9 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.4",
    strengths_available: [
      "Tablet: 100 mg, 300 mg",
      "Oral Liquid: 50 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Active tuberculosis treatment (in combination with Rifampicin, Pyrazinamide, Ethambutol)",
      "Latent tuberculosis preventive therapy (TPT)"
    ],
    dosage_by_age: {
      children: "10–15 mg/kg once daily (max 300 mg/day) as part of national pediatric TB regimen.",
      adults: "300 mg once daily (or 5 mg/kg/day) taken on an empty stomach.",
      elderly: "Standard weight-based dose; mandatory co-administration of Pyridoxine (Vitamin B6) to prevent neurotoxicity."
    },
    max_recommended_dose: "300 mg/day in daily therapy.",
    side_effects: [
      "Peripheral neuropathy (numbness/tingling), elevated liver enzymes, drug-induced hepatitis"
    ],
    precautions_contraindications: "Acute liver disease, chronic alcohol abuse. Co-prescribe Pyridoxine (10–25 mg/day) routinely.",
    clinical_warning: "Prescription anti-tubercular medication under National TB Elimination Program guidelines."
  },
  "Rifampicin": {
    generic_name: "Rifampicin (Rifampin)",
    nlem_reference: "NLEM 2022 Section 6.3.3, 6.4.15 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 6.3 & 6.4",
    strengths_available: [
      "Capsule: 150 mg, 300 mg, 450 mg, 600 mg",
      "Oral Liquid: 100 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "First-line multidrug treatment of tuberculosis and leprosy",
      "Meningococcal meningitis contact prophylaxis"
    ],
    dosage_by_age: {
      children: "10–20 mg/kg once daily (max 600 mg/day) on an empty stomach.",
      adults: "450 mg (<50 kg) or 600 mg (≥50 kg) once daily on an empty stomach.",
      elderly: "Standard weight-based dose; extensive monitoring for hepatic enzymes and drug interactions."
    },
    max_recommended_dose: "600 mg/day.",
    side_effects: [
      "Reddish-orange discoloration of urine, sweat, tears, and saliva (harmless)",
      "Hepatotoxicity, gastrointestinal intolerance, thrombocytopenia"
    ],
    precautions_contraindications: "Potent hepatic CYP3A4 enzyme inducer (drastically reduces levels of oral contraceptives, warfarin, antiretrovirals, diabetes oral agents).",
    clinical_warning: "Urine and tears will turn orange-red. Use alternative non-hormonal contraception."
  },
  "Salbutamol": {
    generic_name: "Salbutamol (Albuterol)",
    nlem_reference: "NLEM 2022 Section 24.1.6 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 24.1",
    strengths_available: [
      "Inhalation (MDI/DPI): 100 mcg/dose",
      "Respirator Solution for Nebulizer: 5 mg/mL",
      "Tablet: 2 mg, 4 mg",
      "Oral Liquid: 2 mg/5 mL"
    ],
    common_uses: [
      "Quick-relief bronchodilator for acute asthma bronchospasm",
      "Reversible airway obstruction in COPD and acute wheezing",
      "Prevention of exercise-induced bronchospasm"
    ],
    dosage_by_age: {
      children: "Inhaler: 1–2 puffs (100–200 mcg) via spacer as needed for acute wheeze. Nebulizer: 2.5 mg under hospital emergency monitoring.",
      adults: "Inhaler: 1–2 puffs (100–200 mcg) as needed for acute breathlessness; max 4 times daily (8 puffs/day). Nebulizer: 2.5–5 mg for acute exacerbations.",
      elderly: "Inhalation route strictly preferred over oral tablets to minimize tachycardia and cardiac arrhythmia risk."
    },
    max_recommended_dose: "Inhaler: 800 mcg (8 puffs) in 24 hours under outpatient conditions.",
    side_effects: [
      "Fine skeletal muscle tremor (especially hands), tachycardia, palpitations, headache, hypokalemia"
    ],
    precautions_contraindications: "Cardiac arrhythmias, hypertension, hyperthyroidism. Frequent need (>3 times/week) indicates uncontrolled asthma requiring inhaled corticosteroid controller therapy.",
    clinical_warning: "Rescue inhaler only; does not treat underlying airway inflammation. Seek emergency care if symptoms do not improve after 4 puffs."
  },
  "Beclometasone": {
    generic_name: "Beclometasone Dipropionate",
    nlem_reference: "WHO Model List of Essential Medicines (2025) Section 25.1 / Budesonide NLEM Section 16.1, 24.1.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 25.1",
    strengths_available: [
      "Inhalation (MDI/DPI): 50 mcg/dose, 100 mcg/dose, 200 mcg/dose",
      "Nasal Spray: 50 mcg/dose"
    ],
    common_uses: [
      "Daily maintenance and controller therapy for persistent asthma",
      "Allergic rhinitis prophylaxis (nasal formulation)"
    ],
    dosage_by_age: {
      children: "Inhalation: 50–100 mcg twice daily with metered-dose inhaler and spacer.",
      adults: "Inhalation: 100–400 mcg twice daily based on severity of asthma.",
      elderly: "Standard dosage with spacer device."
    },
    max_recommended_dose: "Up to 1,000–2,000 mcg/day in severe persistent asthma under pulmonologist care.",
    side_effects: [
      "Oropharyngeal candidiasis (oral thrush), hoarseness (dysphonia), throat irritation"
    ],
    precautions_contraindications: "Not a rescue inhaler (slow onset). Rinse mouth with water and spit out after each use to prevent fungal oral thrush.",
    clinical_warning: "Must be taken consistently every day, even when feeling well, to prevent asthma exacerbations."
  },
  "Cetirizine": {
    generic_name: "Cetirizine Hydrochloride",
    nlem_reference: "NLEM 2022 Section 3.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 3.1",
    strengths_available: [
      "Tablet: 10 mg",
      "Oral Liquid: 5 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Allergic rhinitis (sneezing, rhinorrhea, nasal itching)",
      "Chronic idiopathic urticaria (hives, skin welts)",
      "Allergic conjunctivitis and pruritus"
    ],
    dosage_by_age: {
      children: "Children 2–6 years: 2.5 mg twice daily (or 5 mg once daily); 6–12 years: 5 mg twice daily (or 10 mg once daily).",
      adults: "10 mg once daily orally (or 5 mg twice daily) with water.",
      elderly: "5 mg once daily starting dose; adjust according to renal clearance."
    },
    max_recommended_dose: "10 mg per 24 hours.",
    side_effects: [
      "Mild drowsiness, dry mouth, headache, fatigue, dizziness"
    ],
    precautions_contraindications: "End-stage renal disease (GFR <10 mL/min). Avoid alcohol and central sedatives. Caution when driving or operating machinery.",
    clinical_warning: "Second-generation antihistamine with low sedation, but individual sensitivity varies. Take at bedtime if drowsiness occurs."
  },
  "Loratadine": {
    generic_name: "Loratadine",
    nlem_reference: "WHO Model List of Essential Medicines (2025) Section 3.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 3.1",
    strengths_available: [
      "Tablet: 10 mg",
      "Oral Liquid: 5 mg/5 mL"
    ],
    common_uses: [
      "Seasonal allergic rhinitis and perennial allergic rhinitis",
      "Chronic idiopathic urticaria and allergic skin reactions"
    ],
    dosage_by_age: {
      children: "Children 2–12 years: 5 mg once daily (<30 kg) or 10 mg once daily (>30 kg).",
      adults: "10 mg once daily.",
      elderly: "Standard adult dose of 10 mg once daily (non-sedating profile)."
    },
    max_recommended_dose: "10 mg per 24 hours.",
    side_effects: [
      "Headache, dry mouth, fatigue, rare GI discomfort"
    ],
    precautions_contraindications: "Severe hepatic impairment (start at 10 mg every other day). Non-sedating antihistamine.",
    clinical_warning: "Non-drowsy allergy relief. Consult a doctor if hives persist beyond 6 weeks."
  },
  "Amlodipine": {
    generic_name: "Amlodipine Besylate",
    nlem_reference: "NLEM 2022 Section 10.3.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 10.3",
    strengths_available: [
      "Tablet: 2.5 mg, 5 mg, 10 mg"
    ],
    common_uses: [
      "Essential systemic hypertension",
      "Chronic stable angina pectoris and vasospastic (Prinzmetal's) angina"
    ],
    dosage_by_age: {
      children: "2.5 mg once daily, titrated to max 5 mg daily in children 6–17 years under pediatric cardiologist supervision.",
      adults: "Initial: 5 mg once daily; may be titrated after 1–2 weeks to maximum 10 mg once daily.",
      elderly: "Initial: 2.5 mg once daily recommended due to reduced hepatic clearance and peripheral edema risk."
    },
    max_recommended_dose: "10 mg per 24 hours.",
    side_effects: [
      "Peripheral edema (bilateral ankle swelling), flushing, dizziness, headache, palpitations"
    ],
    precautions_contraindications: "Severe aortic stenosis, severe hypotension, unstable heart failure after MI. Do not discontinue abruptly.",
    clinical_warning: "Long-acting calcium channel blocker. Blood pressure monitoring is mandatory."
  },
  "Enalapril": {
    generic_name: "Enalapril Maleate",
    nlem_reference: "NLEM 2022 Section 10.3.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 10.3",
    strengths_available: [
      "Tablet: 2.5 mg, 5 mg"
    ],
    common_uses: [
      "Essential hypertension and renovascular hypertension",
      "Heart failure with reduced ejection fraction (HFrEF)",
      "Diabetic nephropathy in type 1 and type 2 diabetes"
    ],
    dosage_by_age: {
      children: "2.5 mg once daily in children >20 kg under pediatric specialist guidance.",
      adults: "Initial: 5 mg once daily (2.5 mg if on diuretic). Maintenance: 10–20 mg once daily or divided.",
      elderly: "Initial: 2.5 mg once daily; monitor renal function and serum potassium."
    },
    max_recommended_dose: "40 mg per 24 hours.",
    side_effects: [
      "Persistent dry non-productive cough, dizziness, hypotension, hyperkalemia, angioedema"
    ],
    precautions_contraindications: "ABSOLUTELY CONTRAINDICATED IN PREGNANCY (fetotoxic: renal dysgenesis, skull hypoplasia). Bilateral renal artery stenosis. History of ACE inhibitor angioedema.",
    clinical_warning: "ACE inhibitor requiring baseline creatinine and potassium checks. Discontinue immediately if pregnancy occurs."
  },
  "Hydrochlorothiazide": {
    generic_name: "Hydrochlorothiazide (HCTZ)",
    nlem_reference: "NLEM 2022 Section 10.3.3, 15.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 10.3 & 15.2",
    strengths_available: [
      "Tablet: 12.5 mg, 25 mg, 50 mg"
    ],
    common_uses: [
      "Essential hypertension (monotherapy or combined with ACEI/ARB/CCB)",
      "Edema associated with congestive heart failure and hepatic cirrhosis"
    ],
    dosage_by_age: {
      children: "1–2 mg/kg/day in 1 or 2 divided doses.",
      adults: "Hypertension: 12.5 mg to 25 mg once daily in the morning. Edema: 25–50 mg daily.",
      elderly: "12.5 mg once daily; heightened susceptibility to hyponatremia and hypokalemia."
    },
    max_recommended_dose: "50 mg per 24 hours.",
    side_effects: [
      "Hypokalemia, hyponatremia, hyperuricemia (gout flare), hyperglycemia, photosensitivity"
    ],
    precautions_contraindications: "Anuria, severe renal impairment (eGFR <30 mL/min), refractory hypokalemia/hyponatremia, active gout. Take in morning to prevent nighttime urination.",
    clinical_warning: "Thiazide diuretic. Periodic electrolyte monitoring is required."
  },
  "Furosemide": {
    generic_name: "Furosemide",
    nlem_reference: "NLEM 2022 Section 15.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 15.1",
    strengths_available: [
      "Tablet: 40 mg",
      "Oral Liquid: 10 mg/mL",
      "Injection: 10 mg/mL"
    ],
    common_uses: [
      "Acute pulmonary edema and fluid retention in congestive heart failure",
      "Chronic renal failure edema and nephrotic syndrome",
      "Cirrhotic ascites (combined with spironolactone)"
    ],
    dosage_by_age: {
      children: "1–2 mg/kg per dose orally or IV; maximum 6 mg/kg/day.",
      adults: "20 mg to 40 mg once daily in the morning; dose titrated upward in resistant edema under medical monitoring.",
      elderly: "Initial 20 mg daily; monitor for orthostatic hypotension, dehydration, and electrolyte depletion."
    },
    max_recommended_dose: "Up to 600 mg/day in severe oliguric renal failure under hospital monitoring.",
    side_effects: [
      "Profound diuresis, dehydration, hypokalemia, hyponatremia, hypotension, ototoxicity at high IV doses"
    ],
    precautions_contraindications: "Anuria, severe hypokalemia, hepatic coma, sulfonamide allergy. Potassium supplementation or monitoring usually required.",
    clinical_warning: "Potent loop diuretic. Requires close clinical and laboratory monitoring."
  },
  "Metformin": {
    generic_name: "Metformin Hydrochloride",
    nlem_reference: "NLEM 2022 Section 18.3.1.6 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 18.3",
    strengths_available: [
      "Tablet: 500 mg, 1,000 mg",
      "Modified Release Tablet: 1,000 mg"
    ],
    common_uses: [
      "First-line oral pharmacotherapy for Type 2 Diabetes Mellitus",
      "Polycystic ovary syndrome (PCOS) insulin resistance management"
    ],
    dosage_by_age: {
      children: "Children ≥10 years: 500 mg once or twice daily with meals (max 2,000 mg/day).",
      adults: "Initial: 500 mg once or twice daily with meals. Titrated weekly by 500 mg to 1,000 mg twice daily.",
      elderly: "Assess eGFR prior to initiation. Contraindicated if eGFR <30 mL/min; max 1,000 mg/day if eGFR 30–44 mL/min."
    },
    max_recommended_dose: "2,550 mg/day (immediate release) or 2,000 mg/day (extended release).",
    side_effects: [
      "Gastrointestinal disturbance (diarrhea, nausea, abdominal cramping, metallic taste)",
      "Long-term: Vitamin B12 malabsorption. Rare: lactic acidosis."
    ],
    precautions_contraindications: "Severe renal impairment (eGFR <30 mL/min), acute metabolic acidosis, severe hypoxemia, acute heart failure. Withhold 48h before IV iodinated contrast.",
    clinical_warning: "Take with or immediately after meals to reduce stomach upset. Never take if severely dehydrated or acutely ill."
  },
  "Insulin": {
    generic_name: "Human Insulin (Soluble / NPH / Glargine / Premix)",
    nlem_reference: "NLEM 2022 Section 18.3.1.2, 18.3.1.3, 18.3.1.4, 18.3.1.5 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 18.3",
    strengths_available: [
      "Injection 40 IU/mL: Soluble (Regular), Intermediate Acting (NPH), Premix 30:70",
      "Injection 100 IU/mL: Insulin Glargine (Long-acting analogue)"
    ],
    common_uses: [
      "Type 1 Diabetes Mellitus (absolute insulin deficiency)",
      "Type 2 Diabetes Mellitus inadequately controlled on oral agents",
      "Diabetic ketoacidosis (DKA) and hyperosmolar hyperglycemic state",
      "Gestational diabetes"
    ],
    dosage_by_age: {
      children: "Strictly individualized regimen (typically 0.5–1.0 IU/kg/day) based on frequent self-monitoring of blood glucose under pediatric endocrinologist direction.",
      adults: "Individualized regimen: basal insulin once daily plus prandial regular insulin before meals, adjusted by blood glucose targets.",
      elderly: "Relaxed glycemic targets (HbA1c 7.5–8.0%) to prevent fatal hypoglycemia."
    },
    max_recommended_dose: "Individualized to achieve target blood glucose without causing hypoglycemia.",
    side_effects: [
      "Hypoglycemia (sweating, palpitations, confusion, coma), lipodystrophy at injection sites, weight gain"
    ],
    precautions_contraindications: "Hypoglycemia episodes. Always carry fast-acting carbohydrates. Rotate injection sites. Store unopened vials at 2–8°C; in-use vial at room temperature <30°C for up to 28 days.",
    clinical_warning: "CRITICAL: Never adjust insulin doses without doctor guidance. Skipping meals after injection causes dangerous hypoglycemia."
  },
  "Levothyroxine": {
    generic_name: "Levothyroxine Sodium (T4)",
    nlem_reference: "NLEM 2022 Section 18.6.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 18.6",
    strengths_available: [
      "Tablet: 12.5 mcg, 25 mcg, 50 mcg, 62.5 mcg, 75 mcg, 88 mcg, 100 mcg, 112 mcg, 125 mcg, 150 mcg"
    ],
    common_uses: [
      "Primary, secondary, and tertiary hypothyroidism",
      "Congenital hypothyroidism in neonates and infants",
      "TSH suppression in differentiated thyroid cancer"
    ],
    dosage_by_age: {
      children: "Congenital hypothyroidism: 10–15 mcg/kg/day immediately upon birth under pediatric endocrinologist guidance.",
      adults: "1.6 mcg/kg/day (typically 50–100 mcg once daily), taken on an empty stomach with plain water 30–60 minutes before breakfast.",
      elderly: "Start low (12.5–25 mcg/day) and titrate slowly by 12.5–25 mcg increments every 6–8 weeks to avoid precipitating myocardial ischemia."
    },
    max_recommended_dose: "Individualized based on serum TSH normalization (typically 200–300 mcg/day max).",
    side_effects: [
      "Symptoms of thyrotoxicosis from overtreatment: palpitations, tachycardia, insomnia, tremor, weight loss, heat intolerance"
    ],
    precautions_contraindications: "Untreated subclinical thyrotoxicosis, acute myocardial infarction, uncorrected adrenal insufficiency. Separate by 4 hours from calcium and iron supplements.",
    clinical_warning: "Take once daily in the morning on an empty stomach with plain water. Routine TSH monitoring required."
  },
  "Carbamazepine": {
    generic_name: "Carbamazepine",
    nlem_reference: "NLEM 2022 Section 5.1.1, 23.2.2.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 5.1",
    strengths_available: [
      "Tablet: 100 mg, 200 mg, 400 mg",
      "Modified Release Tablet: 200 mg, 400 mg",
      "Oral Liquid: 100 mg/5 mL (pediatric)"
    ],
    common_uses: [
      "Focal and generalized tonic-clonic seizures in epilepsy",
      "Trigeminal neuralgia pain paroxysms",
      "Bipolar disorder acute mania and mood stabilization"
    ],
    dosage_by_age: {
      children: "10–20 mg/kg/day divided in 2–3 doses, titrated upward gradually under neurologist supervision.",
      adults: "Epilepsy: initial 100–200 mg 1–2 times daily, titrated to 800–1,200 mg/day in divided doses. Trigeminal neuralgia: 100 mg twice daily titrated to relief.",
      elderly: "Start at 100 mg daily; high vulnerability to hyponatremia and drug-drug interactions."
    },
    max_recommended_dose: "1,600 mg/day for epilepsy; 1,200 mg/day for trigeminal neuralgia.",
    side_effects: [
      "Dizziness, ataxia, drowsiness, diplopia, hyponatremia (SIADH), leukopenia, Stevens-Johnson syndrome (SJS)"
    ],
    precautions_contraindications: "Atrioventricular conduction block, history of bone marrow depression. Genetic screening for HLA-B*1502 in Asian patients strongly recommended before initiation.",
    clinical_warning: "Narrow therapeutic index antiepileptic. Do not stop taking abruptly as this can trigger status epilepticus."
  },
  "Sodium valproate": {
    generic_name: "Sodium Valproate / Valproic Acid",
    nlem_reference: "NLEM 2022 Section 5.1.10, 23.2.2.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 5.1",
    strengths_available: [
      "Tablet: 200 mg, 300 mg, 500 mg",
      "Modified Release Tablet: 300 mg, 500 mg",
      "Oral Liquid: 200 mg/5 mL (pediatric)",
      "Injection: 100 mg/mL"
    ],
    common_uses: [
      "Broad-spectrum antiepileptic (absence, myoclonic, tonic-clonic, focal seizures)",
      "Bipolar disorder acute manic episodes",
      "Migraine headache prophylaxis"
    ],
    dosage_by_age: {
      children: "Initial: 10–15 mg/kg/day divided in 2 doses; maintenance 20–30 mg/kg/day under pediatric neurologist guidance.",
      adults: "Initial: 600 mg daily divided in 2 doses; maintenance 1,000–2,000 mg daily.",
      elderly: "Start at 250–500 mg daily; monitor free valproate levels due to decreased plasma protein binding."
    },
    max_recommended_dose: "2,500 mg/day (or 60 mg/kg/day under therapeutic drug monitoring).",
    side_effects: [
      "Weight gain, fine postural tremor, transient hair loss, nausea, thrombocytopenia, fatal pancreatitis / hepatotoxicity"
    ],
    precautions_contraindications: "ABSOLUTELY CONTRAINDICATED IN PREGNANCY (high risk of congenital malformations and neurodevelopmental delays). Active liver disease. Mitochondrial disorders.",
    clinical_warning: "Pregnancy prevention program mandatory for female patients. Baseline liver function tests required."
  },
  "Amitriptyline": {
    generic_name: "Amitriptyline Hydrochloride",
    nlem_reference: "NLEM 2022 Section 5.2.1.1, 7.4.2, 23.2.1.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 24.2",
    strengths_available: [
      "Tablet: 10 mg, 25 mg, 50 mg, 75 mg"
    ],
    common_uses: [
      "Major depressive disorder",
      "Chronic neuropathic pain (diabetic neuropathy, post-herpetic neuralgia)",
      "Migraine headache prophylaxis and tension headache prevention",
      "Fibromyalgia and chronic musculoskeletal pain syndromes"
    ],
    dosage_by_age: {
      children: "Not recommended for depression under 18 years. Migraine prophylaxis in adolescents only under child neurologist guidance.",
      adults: "Neuropathic pain/Migraine: 10–25 mg at bedtime, titrated by 10–25 mg every 1–2 weeks to 25–75 mg at bedtime. Depression: 50–150 mg at bedtime.",
      elderly: "Initial 10 mg at bedtime; high risk of anticholinergic side effects (confusion, urinary retention, orthostatic hypotension, falls)."
    },
    max_recommended_dose: "150 mg/day (inpatient psychiatric: up to 200 mg/day).",
    side_effects: [
      "Dry mouth, marked sedation, blurred vision, constipation, urinary retention, weight gain, orthostatic hypotension, cardiac arrhythmias"
    ],
    precautions_contraindications: "Recent myocardial infarction, arrhythmias, heart block, narrow-angle glaucoma, severe liver disease. Never combine with MAO inhibitors.",
    clinical_warning: "Causes significant nighttime sedation. Take 1–2 hours before bedtime. Do not drive if drowsy."
  },
  "Fluoxetine": {
    generic_name: "Fluoxetine Hydrochloride",
    nlem_reference: "NLEM 2022 Section 7.4.6, 23.2.1.3, 23.4.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 24.2",
    strengths_available: [
      "Capsule: 10 mg, 20 mg, 40 mg, 60 mg"
    ],
    common_uses: [
      "Major depressive disorder",
      "Obsessive-compulsive disorder (OCD)",
      "Bulimia nervosa and panic disorder"
    ],
    dosage_by_age: {
      children: "Children ≥8 years with moderate-to-severe depression: 10–20 mg once daily under child psychiatrist monitoring.",
      adults: "20 mg once daily in the morning; may be titrated after several weeks up to 40–60 mg daily for OCD or refractory depression.",
      elderly: "Initial 10 mg once daily; max recommended 40 mg daily."
    },
    max_recommended_dose: "80 mg per 24 hours.",
    side_effects: [
      "Nausea, insomnia, anxiety, headache, anorexia, sexual dysfunction, hyponatremia"
    ],
    precautions_contraindications: "Concurrent use with MAOIs (contraindicated, risk of fatal Serotonin Syndrome). Monitor young patients closely for emergent suicidal ideation during early treatment.",
    clinical_warning: "Selective serotonin reuptake inhibitor (SSRI). Requires 2–4 weeks to achieve therapeutic antidepressant effect."
  },
  "Propranolol": {
    generic_name: "Propranolol Hydrochloride",
    nlem_reference: "NLEM 2022 Section 5.2.1.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 10.2",
    strengths_available: [
      "Tablet: 10 mg, 20 mg, 40 mg"
    ],
    common_uses: [
      "Migraine headache prophylaxis",
      "Essential tremor and somatic symptoms of performance anxiety",
      "Hypertension, angina pectoris, supraventricular arrhythmias, thyrotoxicosis"
    ],
    dosage_by_age: {
      children: "Infantile hemangioma / pediatric arrhythmias: under specialist pediatric cardiology protocol only.",
      adults: "Migraine prevention: 40 mg 2–3 times daily (titrated to 80–160 mg daily). Performance anxiety: 10–40 mg 1 hour before event.",
      elderly: "Start at 10–20 mg daily; high susceptibility to bradycardia, fatigue, and hypotension."
    },
    max_recommended_dose: "240 mg/day for migraine prophylaxis; 320 mg/day for cardiovascular indications.",
    side_effects: [
      "Bradycardia, cold extremities, fatigue, sleep disturbances, bronchospasm in susceptible individuals"
    ],
    precautions_contraindications: "ABSOLUTELY CONTRAINDICATED IN BRONCHIAL ASTHMA and severe COPD (can trigger fatal bronchospasm). Sinus bradycardia, cardiogenic shock. Do not stop abruptly.",
    clinical_warning: "Non-selective beta-blocker. Strictly contraindicated in asthmatic patients."
  },
  "Allopurinol": {
    generic_name: "Allopurinol",
    nlem_reference: "NLEM 2022 Section 2.3.1, 7.4.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 2.3",
    strengths_available: [
      "Tablet: 100 mg, 300 mg"
    ],
    common_uses: [
      "Chronic management of primary and secondary hyperuricemia in gout",
      "Prevention of recurrent uric acid kidney stones",
      "Prophylaxis of tumor lysis syndrome in chemotherapy"
    ],
    dosage_by_age: {
      children: "Secondary hyperuricemia in pediatric malignancies: 10–20 mg/kg/day under pediatric oncology care.",
      adults: "Initial: 100 mg once daily after food; titrate weekly by 100 mg to achieve serum urate <6 mg/dL (maintenance 200–300 mg daily).",
      elderly: "Initial: 50–100 mg daily; adjust strictly according to creatinine clearance."
    },
    max_recommended_dose: "800 mg/day (or 300 mg/day in moderate renal impairment).",
    side_effects: [
      "Maculopapular rash, gastrointestinal distress, acute gout flare precipitation (co-prescribe colchicine), severe hypersensitivity syndrome"
    ],
    precautions_contraindications: "DO NOT INITIATE DURING AN ACUTE GOUT FLARE (wait until acute inflammation subsides). Discontinue immediately at first sign of skin rash.",
    clinical_warning: "Urate-lowering therapy must not be started during an acute painful gout attack. Drink plenty of water."
  },
  "Colchicine": {
    generic_name: "Colchicine",
    nlem_reference: "NLEM 2022 Section 2.3.2 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 2.3",
    strengths_available: [
      "Tablet: 0.5 mg"
    ],
    common_uses: [
      "Acute relief of painful gout flares",
      "Prophylaxis of acute gout flares during initiation of allopurinol",
      "Familial Mediterranean fever"
    ],
    dosage_by_age: {
      children: "Familial Mediterranean fever: under pediatric specialist care only.",
      adults: "Acute gout: 1 mg (two 0.5 mg tablets) immediately at symptom onset, followed by 0.5 mg one hour later. No further doses for 12 hours. Prophylaxis: 0.5 mg 1–2 times daily.",
      elderly: "Dose reduction mandatory (0.5 mg max initial); high risk of cumulative neuromuscular toxicity and drug interactions."
    },
    max_recommended_dose: "1.5 mg total per acute attack course; must not repeat course within 3 days.",
    side_effects: [
      "Diarrhea, abdominal cramping, nausea, vomiting (toxicity indicators), neuromuscular weakness"
    ],
    precautions_contraindications: "Narrow therapeutic window. Severe renal or hepatic impairment (contraindicated with macrolides like clarithromycin). Stop immediately if diarrhea occurs.",
    clinical_warning: "Toxic in overdose. Stop taking immediately and call a doctor if diarrhea, nausea, or abdominal pain occurs."
  },
  "Ferrous salt": {
    generic_name: "Ferrous Salts (Elemental Iron)",
    nlem_reference: "NLEM 2022 Section 8.1.2, 8.1.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 8.1",
    strengths_available: [
      "Tablet: Equivalent to 60 mg elemental iron",
      "Oral Liquid: 20 mg elemental iron/mL (pediatric)",
      "Injection: 50 mg/mL"
    ],
    common_uses: [
      "Treatment and prevention of iron-deficiency anemia",
      "Maternal nutritional supplementation during pregnancy and lactation"
    ],
    dosage_by_age: {
      children: "Treatment of iron deficiency: 3–6 mg elemental iron/kg/day divided in 2–3 doses between meals.",
      adults: "Therapeutic: 100–200 mg elemental iron daily in divided doses. Prophylactic: 60 mg elemental iron daily.",
      elderly: "60–100 mg elemental iron daily; high rate of constipation and gastrointestinal intolerance."
    },
    max_recommended_dose: "200 mg elemental iron daily for treatment.",
    side_effects: [
      "Dark green or black stools (harmless), constipation, nausea, abdominal discomfort, heartburn"
    ],
    precautions_contraindications: "Hemochromatosis, chronic hemolytic anemia. KEEP OUT OF REACH OF CHILDREN (accidental iron ingestion in young children is a fatal emergency). Take with Vitamin C for absorption.",
    clinical_warning: "Stools will turn harmlessly black. Accidental overdose in toddlers is life-threatening."
  },
  "Folic acid": {
    generic_name: "Folic Acid (Vitamin B9)",
    nlem_reference: "NLEM 2022 Section 8.1.3, 8.1.4 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 8.1",
    strengths_available: [
      "Tablet: 1 mg, 5 mg"
    ],
    common_uses: [
      "Megaloblastic anemia due to folate deficiency",
      "Prevention of neural tube defects (NTDs) in women planning pregnancy",
      "Toxicity prophylaxis in patients on methotrexate"
    ],
    dosage_by_age: {
      children: "1–5 mg once daily for folate deficiency until full hematological recovery.",
      adults: "Treatment: 5 mg daily for 4 months. Pregnancy prophylaxis: 0.4–1 mg daily (5 mg daily in high-risk women with prior NTD).",
      elderly: "1–5 mg daily; always verify Vitamin B12 status before high-dose folate to prevent irreversible neurological damage."
    },
    max_recommended_dose: "5 mg/day (15 mg/day in severe malabsorption).",
    side_effects: [
      "Extremely well tolerated. Very rare mild gastrointestinal symptoms, hypersensitivity"
    ],
    precautions_contraindications: "Never administer folic acid alone in undiagnosed megaloblastic anemia without ruling out Vitamin B12 deficiency (can mask B12-induced subacute combined cord degeneration).",
    clinical_warning: "Vitamin B12 deficiency must be ruled out before initiating high-dose folic acid."
  },
  "Hydrocortisone": {
    generic_name: "Hydrocortisone",
    nlem_reference: "NLEM 2022 Section 3.4, 18.1.3, 24.1.3 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 18.1",
    strengths_available: [
      "Cream / Ointment: 1%",
      "Tablet: 5 mg, 10 mg, 20 mg",
      "Powder for Injection: 100 mg, 200 mg"
    ],
    common_uses: [
      "Topical: mild eczema, contact dermatitis, insect bites, and inflammatory rashes",
      "Systemic: acute adrenal insufficiency, severe anaphylaxis, septic shock, status asthmaticus"
    ],
    dosage_by_age: {
      children: "Topical 1%: apply thinly once or twice daily for up to 7 days. Avoid prolonged use on diaper area.",
      adults: "Topical: apply sparingly 1–2 times daily for 1–2 weeks. Systemic IV: 100–200 mg every 6 hours in acute crisis under hospital supervision.",
      elderly: "Topical: use lowest potency and shortest duration to prevent skin thinning and purpura."
    },
    max_recommended_dose: "Topical: limited area. Systemic: determined by clinical crisis severity.",
    side_effects: [
      "Topical: local skin atrophy, striae, telangiectasia, secondary skin infection. Systemic: hypertension, hyperglycemia."
    ],
    precautions_contraindications: "Do not apply to infected skin (viral, bacterial, fungal) without antimicrobial coverage. Avoid face and eyes.",
    clinical_warning: "Mild topical steroid. Do not use on infected or ulcerated skin."
  },
  "Permethrin": {
    generic_name: "Permethrin",
    nlem_reference: "NLEM 2022 Section 11.5.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 11.5",
    strengths_available: [
      "Cream: 5%",
      "Lotion: 1%"
    ],
    common_uses: [
      "Scabies infestation (Sarcoptes scabiei)",
      "Pediculosis capitis (head lice) and pubic lice"
    ],
    dosage_by_age: {
      children: "Infants 2 months–2 years: apply 5% cream to entire body including face, neck, and scalp (avoiding eyes/mouth) under supervision. Leave on for 8–12 hours.",
      adults: "5% cream: apply thoroughly from neck down to soles of feet. Leave on skin for 8–14 hours before washing off. Repeat after 7 days if live mites persist.",
      elderly: "Ensure full body coverage including scalp, neck, and behind ears."
    },
    max_recommended_dose: "One 30g tube usually sufficient for single adult application.",
    side_effects: [
      "Mild transient stinging, burning, itching, erythema (pruritus may persist for 2 weeks after mite eradication)"
    ],
    precautions_contraindications: "For external cutaneous use only. Treat all household contacts simultaneously. Wash all bedding and clothing in hot water (>60°C).",
    clinical_warning: "All close household contacts must be treated simultaneously to prevent reinfection."
  },
  "Chloramphenicol": {
    generic_name: "Chloramphenicol",
    nlem_reference: "WHO Model List of Essential Medicines (2025) Section 21.1 • Healthcare Level: P, S, T",
    who_reference: "WHO Model List of Essential Medicines (2025) Section 21.1",
    strengths_available: [
      "Eye Drops: 0.5%",
      "Eye Ointment: 1%"
    ],
    common_uses: [
      "Acute superficial bacterial conjunctivitis",
      "Bacterial keratitis and external ocular infections"
    ],
    dosage_by_age: {
      children: "Eye drops: 1 drop in affected eye(s) every 2–4 hours for children ≥2 years under supervision.",
      adults: "Eye drops 0.5%: 1 drop every 2 hours for first 48 hours, then every 4 hours while awake for 5–7 days. Eye ointment 1%: apply at bedtime.",
      elderly: "Standard ophthalmic administration."
    },
    max_recommended_dose: "Ophthalmic formulation; standard course 5 to 7 days.",
    side_effects: [
      "Transient ocular stinging or burning after instillation, local hypersensitivity"
    ],
    precautions_contraindications: "For ophthalmic use only. Do not wear contact lenses during treatment. Discontinue if no improvement after 48 hours and consult an ophthalmologist.",
    clinical_warning: "For eye use only. Discontinue and see an eye doctor if vision changes or severe eye pain occurs."
  }
};

// Enrich all 50 records
const enrichedData = existingData.map(item => {
  const profile = CLINICAL_PROFILES[item.medicine];
  if (!profile) {
    console.warn("No clinical profile found for:", item.medicine);
    return item;
  }
  return {
    ...item,
    generic_name: profile.generic_name,
    nlem_reference: profile.nlem_reference,
    who_reference: item.who_reference || profile.who_reference,
    strengths_available: profile.strengths_available,
    common_uses: profile.common_uses,
    dosage_by_age: profile.dosage_by_age,
    max_recommended_dose: profile.max_recommended_dose,
    side_effects: profile.side_effects,
    precautions_contraindications: profile.precautions_contraindications,
    clinical_warning: profile.clinical_warning
  };
});

// Write to data/medicines-reference.json
fs.writeFileSync(path.join(rootDir, 'data', 'medicines-reference.json'), JSON.stringify(enrichedData, null, 2), 'utf8');

// Write to js/medicine-dataset.js as executable JS
const jsContent = `/**
 * MediLingo Healthcare Platform
 * Clinical Medicine Reference Dataset (50 Essential Medicines)
 * Sourced from:
 * - National List of Essential Medicines (NLEM) 2022 (Government of India)
 * - WHO Model List of Essential Medicines (2025)
 * 
 * DISCLAIMER: This reference guide is strictly for educational and informational purposes.
 * It is not a substitute for professional medical advice, diagnosis, or clinical prescription.
 * Always consult a qualified, registered medical practitioner before taking any medication.
 */

const MEDICINE_REFERENCE_DATA = ${JSON.stringify(enrichedData, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = MEDICINE_REFERENCE_DATA;
}
`;

fs.writeFileSync(path.join(rootDir, 'js', 'medicine-dataset.js'), jsContent, 'utf8');
console.log('Successfully enriched all ' + enrichedData.length + ' medicine records!');
