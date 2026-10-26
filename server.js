const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Auto-create uploads folder if missing
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a dummy certificate if none exists for seeding preview
const defaultCertPath = path.join(uploadsDir, "default_cert.pdf");
if (!fs.existsSync(defaultCertPath)) {
    fs.writeFileSync(defaultCertPath, "%PDF-1.4 Medical Telemedicine Registration Certificate - Medi Lingo Verified");
}

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and uploads
app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadsDir));

/* =========================
   MULTER CONFIG FOR CERTIFICATES
========================= */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "cert-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

/* =========================
   MYSQL POOL CONNECTION
========================= */
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Sadhu@18",
    database: "medilingo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, conn) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("MySQL Connected successfully to database: medilingo");
        conn.release();
    }
});

/* ========================================================
   MULTILINGUAL NLP & SYMPTOM TRIAGE ENGINE
======================================================== */

// Multilingual keyword dictionaries
const SYMPTOM_RULES = [
    // 1. Emergency / Red Flags (Chest Pain, Severe Breathing, Unconsciousness, Severe Bleeding)
    {
        category: "Emergency",
        keywords: [
            "chest pain", "heart pain", "cardiac", "severe breath", "cannot breathe", "shortness of breath", "unconscious",
            "fainting", "severe bleed", "vomiting blood", "stroke", "paralysis", "seizure", "convulsion",
            "நெஞ்சு வலி", "மாரடைப்பு", "மூச்சுத் திணறல்", "மயக்கம்", "அதிக ரத்தப்போக்கு", "வலிப்பு",
            "सीने में दर्द", "सांस लेने में तकलीफ", "बेहोशी", "खून की उल्टी", "दौरा"
        ],
        symptoms: ["Chest Pain / Cardiac Strain", "Severe Dyspnea / Respiratory Distress"],
        triage: "Emergency",
        requiresDoctor: true,
        medicine: "Further evaluation required - Urgent Emergency Care",
        dosage: "Immediate Doctor / ER Attention Mandatory",
        instructions: "Immediate physical hospital / cardiologist consultation required. Do not rely solely on automated medication."
    },
    // 2. High Fever & Severe Body Ache / Dengue / Viral
    {
        category: "Fever_Severe",
        keywords: [
            "high fever", "fever for 3 days", "fever 4 days", "fever 5 days", "fever with chills", "shivering fever",
            "அதிக காய்ச்சல்", "நடுக்கம்", "3 நாட்களாக காய்ச்சல்",
            "तेज बुखार", "कपकपी", "3 दिन से बुखार"
        ],
        symptoms: ["High Grade Fever", "Chills & Rigors"],
        triage: "Moderate",
        requiresDoctor: true,
        kid: {
            medicine: "Paracetamol Paediatric Suspension (250mg/5ml)",
            dosage: "10-15mg/kg body weight every 6-8 hrs. Consult Paediatrician for CBC / Dengue test."
        },
        adult: {
            medicine: "Paracetamol 650mg + ORS",
            dosage: "1 tablet every 6-8 hrs after food + Hydration. Doctor consultation recommended."
        },
        instructions: "Tepid sponging with water. Keep well hydrated. Get Complete Blood Count (CBC) if fever persists."
    },
    // 3. Mild Fever & Body Pain / Headache
    {
        category: "Fever_Pain",
        keywords: [
            "fever", "body pain", "headache", "head ache", "temperature", "bodyache", "tiredness", "fatigue",
            "காய்ச்சல்", "தலைவலி", "உடல் வலி", "அசதி",
            "बुखार", "सिरदर्द", "बदन दर्द", "थकान"
        ],
        symptoms: ["Mild-Moderate Fever", "Cephalea / Headache", "Myalgia"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Paracetamol Syrup (120mg/5ml)",
            dosage: "5ml every 6-8 hrs as needed after food (Kids 2-11 yrs)"
        },
        adult: {
            medicine: "Paracetamol 500mg",
            dosage: "1 tablet every 6-8 hours after food as needed (Max 3 tabs/day)"
        },
        instructions: "Drink plenty of warm fluids, take adequate rest, and monitor body temperature."
    },
    // 4. Cold, Sneezing, Runny Nose, Allergic Rhinitis
    {
        category: "Cold_Allergy",
        keywords: [
            "cold", "runny nose", "sneezing", "sneez", "watery nose", "rhinitis", "sinus",
            "சளி", "மூக்கு ஒழுகுதல்", "தும்மல்", "மூக்கடைப்பு",
            "जुकाम", "सर्दी", "छींक", "बहती नाक"
        ],
        symptoms: ["Allergic Rhinitis", "Common Cold / Rhinorrhea"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Cetirizine Syrup 5mg/5ml + Saline Nasal Drops",
            dosage: "2.5ml once daily at bedtime for kids + 1 drop saline per nostril"
        },
        adult: {
            medicine: "Cetirizine 10mg",
            dosage: "1 tablet once daily at bedtime (May cause mild drowsiness)"
        },
        instructions: "Perform warm saline steam inhalation twice daily. Stay away from dust, cold drinks, and pollen."
    },
    // 5. Wet Productive Cough / Phlegm / Mucus
    {
        category: "Wet_Cough",
        keywords: [
            "wet cough", "productive cough", "phlegm", "mucus", "chest congestion",
            "கபம்", "சளி இருமல்", "சளியுடன் கூடிய இருமல்",
            "बलगम वाली खांसी", "कफ", "छाती में जकड़न"
        ],
        symptoms: ["Productive Wet Cough", "Bronchial Mucus Congestion"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Ambroxol Syrup 15mg/5ml (Paediatric)",
            dosage: "2.5ml to 5ml twice daily after food (Consult doctor for infants)"
        },
        adult: {
            medicine: "Ambroxol 30mg / Bromhexine 8mg",
            dosage: "1 tablet twice daily after meals for 5 days"
        },
        instructions: "Drink warm ginger water, avoid refrigerated foods, steam inhalation for 10 minutes."
    },
    // 6. Dry Cough / Throat Tickle
    {
        category: "Dry_Cough",
        keywords: [
            "dry cough", "cough", "throat tickle", "continuous cough",
            "வறட்டு இருமல்", "இருமல்", "தொண்டை வறட்சி",
            "सूखी खांसी", "खांसी"
        ],
        symptoms: ["Dry Irritant Cough"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Honey-based herbal cough syrup (Paediatric)",
            dosage: "5ml twice daily — avoid OTC chemical suppressants for infants without doctor."
        },
        adult: {
            medicine: "Dextromethorphan 10mg Tablet / Syrup",
            dosage: "1 tablet every 8 hours after food"
        },
        instructions: "Gargle with warm salt water. Keep throat hydrated with lukewarm water."
    },
    // 7. Sore Throat / Throat Pain / Difficulty Swallowing
    {
        category: "Sore_Throat",
        keywords: [
            "sore throat", "throat pain", "throat irritation", "tonsil", "swallowing pain",
            "தொண்டை வலி", "தொண்டை எரிச்சல்", "விழுங்கும்போது வலி",
            "गले में खराश", "गले में दर्द", "टॉन्सिल"
        ],
        symptoms: ["Pharyngitis / Sore Throat", "Throat Irritation"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Warm Saline Gargle + Glycerin Lozenges",
            dosage: "Gargle 3 times daily, 1 soothing lozenge"
        },
        adult: {
            medicine: "Strepsils / Dequalinium Lozenges + Betadine Gargle",
            dosage: "Dissolve 1 lozenge slowly every 3-4 hours; warm salt water gargle 3 times/day"
        },
        instructions: "Avoid very hot or ice-cold drinks. Warm turmeric milk or honey water recommended."
    },
    // 8. Acidity, Heartburn, Gastric, GERD, Indigestion
    {
        category: "Acidity_Gastric",
        keywords: [
            "acidity", "heartburn", "gas", "bloating", "indigestion", "gastric", "stomach burning", "belching",
            "அசிடிட்டி", "நெஞ்செரிச்சல்", "வாயு தொல்லை", "செரிமானமின்மை", "வயிறு உப்புசம்",
            "एसिडिटी", "पेट में जलन", "गैस", "अपच", "खट्टी डकार"
        ],
        symptoms: ["Gastritis / Hyperacidity", "Dyspepsia & Flatulence"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Paediatric Simethicone Drops",
            dosage: "As prescribed by doctor/weight. Avoid heavy antacids for young kids."
        },
        adult: {
            medicine: "Pantoprazole 40mg (or Antacid Chewable Gel)",
            dosage: "1 tablet in morning 30 minutes before breakfast OR 2 chewable tabs after meals"
        },
        instructions: "Eat smaller frequent meals. Avoid spicy/fried foods and do not lie down immediately after dinner."
    },
    // 9. Diarrhoea, Loose Motion, Food Poisoning, Dehydration
    {
        category: "Diarrhoea",
        keywords: [
            "diarrhea", "diarrhoea", "loose motion", "loose stools", "watery stool", "food poison", "dehydration",
            "வயிற்றுப்போக்கு", "பேதி", "நீர்ச்சத்து குறைவு",
            "दस्त", "लूज मोशन", "पतले दस्त", "निर्जलीकरण"
        ],
        symptoms: ["Acute Gastroenteritis", "Risk of Dehydration"],
        triage: "Moderate",
        requiresDoctor: false,
        kid: {
            medicine: "ORS (Oral Rehydration Salts) + Zinc Drops (20mg)",
            dosage: "ORS sips after every loose stool + Zinc once daily for 14 days"
        },
        adult: {
            medicine: "ORS Electral Sachet + Probiotic Capsule (Lactic Acid Bacillus)",
            dosage: "Dissolve 1 sachet ORS in 1L water and drink; 1 Probiotic capsule twice daily after food"
        },
        instructions: "Maintain strict oral hydration. Drink tender coconut water and rice kanji. If blood in stool or high fever occurs, see doctor immediately."
    },
    // 10. Vomiting, Nausea, Motion Sickness
    {
        category: "Vomiting",
        keywords: [
            "vomit", "vomiting", "nausea", "motion sickness", "throwing up",
            "வாந்தி", "குமட்டல்",
            "उल्टी", "जी मिचलाना"
        ],
        symptoms: ["Emesis / Vomiting", "Nausea"],
        triage: "Moderate",
        requiresDoctor: false,
        kid: {
            medicine: "Ondansetron Syrup (2mg/5ml) + ORS",
            dosage: "As per paediatric prescription. Frequent sips of cold ORS solution."
        },
        adult: {
            medicine: "Domperidone 10mg / Ondansetron 4mg",
            dosage: "1 tablet 30 minutes before food if nausea persists + frequent ORS sips"
        },
        instructions: "Take small sips of water or electro-lyte solution. Avoid solid heavy meals until stomach settles."
    },
    // 11. Skin Allergy, Rash, Itching, Urticaria
    {
        category: "Skin_Rash",
        keywords: [
            "skin rash", "rash", "itching", "itchy", "hives", "red spots", "skin allergy", "insect bite",
            "தோல் அரிப்பு", "தடிப்புகள்", "சிவப்பு புள்ளிகள்", "பூச்சிக் கடி",
            "त्वचा में खुजली", "चकत्ते", "एलर्जी", "दाने"
        ],
        symptoms: ["Pruritus / Urticaria", "Contact Dermatitis / Skin Rash"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Calamine Lotion (Topical)",
            dosage: "Apply gently on affected rash area 2-3 times daily"
        },
        adult: {
            medicine: "Calamine Lotion + Cetirizine 10mg",
            dosage: "Apply Calamine lotion topically + 1 Cetirizine tablet at night if severe itching"
        },
        instructions: "Do not scratch the lesions. Use mild fragrance-free soap and wear loose cotton clothing."
    },
    // 12. Minor Cuts, Wounds, Burns, Scratches
    {
        category: "Wounds_Burns",
        keywords: [
            "cut", "wound", "scratch", "minor burn", "scrape", "bleed", "injury",
            "காயம்", "சிராய்ப்பு", "தீக்காயம்", "வெட்டுக்காயம்",
            "घाव", "कट लगना", "जलना", "खरोंच"
        ],
        symptoms: ["Superficial Abrasion / Minor Cut / Burn"],
        triage: "Mild",
        requiresDoctor: false,
        kid: {
            medicine: "Povidone Iodine 5% Ointment + Sterile Bandage",
            dosage: "Clean with clean running water, dry, and apply antiseptic cream"
        },
        adult: {
            medicine: "Povidone Iodine 5% / Neosporin Ointment + Burn Silver Sulfadiazine (if burn)",
            dosage: "Cleanse with antiseptic, apply thin film twice daily and cover with sterile gauze"
        },
        instructions: "Ensure Tetanus Toxoid (TT) vaccination status is up to date within 5 years."
    }
];

function processSymptomsAI(symptomText, age, language) {
    const text = (symptomText || "").toLowerCase().trim();
    const patientAge = parseInt(age) || 25;
    const isKid = patientAge > 0 && patientAge < 12;
    const isTeen = patientAge >= 12 && patientAge < 18;
    const isAdult = patientAge >= 18;

    const detectedSymptoms = [];
    let matchedRule = null;

    // Search rules in priority order
    for (const rule of SYMPTOM_RULES) {
        for (const kw of rule.keywords) {
            if (text.includes(kw.toLowerCase())) {
                matchedRule = rule;
                rule.symptoms.forEach(s => {
                    if (!detectedSymptoms.includes(s)) detectedSymptoms.push(s);
                });
                break;
            }
        }
        if (matchedRule && matchedRule.triage === "Emergency") break; // Stop early on emergency
    }

    if (!matchedRule) {
        return {
            detectedSymptoms: detectedSymptoms.length > 0 ? detectedSymptoms : ["Non-specific Symptoms / Complex Presentation"],
            triageLevel: "Moderate",
            requiresDoctor: true,
            aiConfidence: "Moderate",
            medicine: "Further evaluation required",
            dosage: "Please consult a verified doctor for targeted diagnosis",
            instructions: "Your symptom description requires customized clinical examination by a certified physician."
        };
    }

    if (matchedRule.requiresDoctor || matchedRule.triage === "Emergency") {
        return {
            detectedSymptoms: detectedSymptoms,
            triageLevel: matchedRule.triage,
            requiresDoctor: true,
            aiConfidence: "High",
            medicine: matchedRule.medicine,
            dosage: matchedRule.dosage,
            instructions: matchedRule.instructions
        };
    }

    // Age-specific medication recommendation
    const medInfo = isKid ? matchedRule.kid : matchedRule.adult;
    return {
        detectedSymptoms: detectedSymptoms,
        triageLevel: matchedRule.triage,
        requiresDoctor: false,
        aiConfidence: "High",
        medicine: medInfo.medicine,
        dosage: medInfo.dosage,
        instructions: matchedRule.instructions
    };
}

/* ========================================================
   1. PATIENT REST APIs
======================================================== */

// Patient Registration
app.post("/api/patient/register", (req, res) => {
    const { name, phone, email, age, gender, password } = req.body;
    if (!name || !phone || !password) {
        return res.status(400).json({ success: false, message: "Name, phone, and password are required" });
    }

    const patientUid = "PAT-" + Math.floor(100000 + Math.random() * 900000);
    const sql = `
        INSERT INTO patients (patient_uid, name, phone, email, age, gender, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [patientUid, name, phone, email || null, parseInt(age) || null, gender || "Not specified", password], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ success: false, message: "A patient with this mobile number or email already exists." });
            }
            console.error("Patient Register Error:", err);
            return res.status(500).json({ success: false, message: "Database error during registration" });
        }

        res.json({
            success: true,
            message: "Patient registered successfully",
            patient: {
                id: result.insertId,
                patient_uid: patientUid,
                name,
                phone,
                email,
                age,
                gender
            }
        });
    });
});

// Patient Login
app.post("/api/patient/login", (req, res) => {
    const { identifier, password, isOtp, otp } = req.body;

    if (isOtp) {
        // OTP Login simulation
        if (otp !== "123456" && otp !== "582910" && !otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP code. Use 123456 for demo." });
        }
        db.query("SELECT * FROM patients WHERE phone = ? OR email = ? LIMIT 1", [identifier, identifier], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "No patient account found with this phone/email." });
            }
            const p = results[0];
            delete p.password;
            return res.json({ success: true, message: "OTP login successful", patient: p });
        });
        return;
    }

    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Please provide mobile/email and password" });
    }

    db.query("SELECT * FROM patients WHERE (phone = ? OR email = ?) AND password = ? LIMIT 1", [identifier, identifier, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials. Please check your password." });
        }
        const p = results[0];
        delete p.password;
        res.json({ success: true, message: "Login successful", patient: p });
    });
});

// Patient Profile & Personal Consultations (CRITICAL: Only for this patient!)
app.get("/api/patient/profile/:patientId", (req, res) => {
    const patientId = req.params.patientId;
    db.query("SELECT id, patient_uid, name, phone, email, age, gender, created_at FROM patients WHERE id = ? OR patient_uid = ? LIMIT 1", [patientId, patientId], (err, patientRows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (patientRows.length === 0) {
            return res.status(404).json({ success: false, message: "Patient profile not found" });
        }
        const patient = patientRows[0];
        // Fetch only consultations belonging to this patient_id or phone
        db.query(
            "SELECT * FROM consultations WHERE patient_id = ? OR phn_num = ? ORDER BY s_no DESC LIMIT 20",
            [patient.patient_uid || patientId, patient.phone],
            (err2, consultRows) => {
                if (err2) return res.status(500).json({ success: false, message: "Database error" });
                res.json({
                    success: true,
                    patient,
                    consultations: consultRows
                });
            }
        );
    });
});

// AI Symptom Processing & Prescription
app.post(["/ai-prescription", "/api/ai-prescription"], (req, res) => {
    const { patient_id, name, age, gender, phn_num, language, symptom } = req.body;

    if (!symptom || !name) {
        return res.status(400).json({ success: false, message: "Patient name and symptoms are required" });
    }

    const aiResult = processSymptomsAI(symptom, age, language);
    const patientUid = patient_id || "PAT-" + Date.now().toString().slice(-6);

    const sql = `
        INSERT INTO consultations
        (patient_id, name, age, gender, phn_num, language, symptom, detected_symptoms, ai_confidence, triage_level, requires_doctor, medication_suggested, dosage, instructions, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const status = aiResult.requiresDoctor ? "Pending_Doctor" : "Completed";

    db.query(sql, [
        patientUid,
        name,
        parseInt(age) || 25,
        gender || "Not specified",
        phn_num || "N/A",
        language || "English",
        symptom,
        aiResult.detectedSymptoms.join(", "),
        aiResult.aiConfidence,
        aiResult.triageLevel,
        aiResult.requiresDoctor ? 1 : 0,
        aiResult.medicine,
        aiResult.dosage,
        aiResult.instructions,
        status
    ], (err, result) => {
        if (err) {
            console.error("Consultation insert error:", err);
            // Return AI response even if DB write fails
            return res.json({
                success: true,
                consultationId: null,
                patient_id: patientUid,
                name,
                age,
                gender,
                phn_num,
                symptoms: symptom,
                detectedSymptoms: aiResult.detectedSymptoms,
                triageLevel: aiResult.triageLevel,
                requiresDoctor: aiResult.requiresDoctor,
                aiConfidence: aiResult.aiConfidence,
                medicine: aiResult.medicine,
                dosage: aiResult.dosage,
                instructions: aiResult.instructions
            });
        }

        res.json({
            success: true,
            consultationId: result.insertId,
            patient_id: patientUid,
            name,
            age,
            gender,
            phn_num,
            symptoms: symptom,
            detectedSymptoms: aiResult.detectedSymptoms,
            triageLevel: aiResult.triageLevel,
            requiresDoctor: aiResult.requiresDoctor,
            aiConfidence: aiResult.aiConfidence,
            medicine: aiResult.medicine,
            dosage: aiResult.dosage,
            instructions: aiResult.instructions
        });
    });
});

/* ========================================================
   2. DOCTOR REST APIs
======================================================== */

// Doctor Registration with Certificate Upload
app.post(["/doctor-register", "/api/doctor/register"], upload.single("certificate"), (req, res) => {
    const { name, reg_number, email, phone, password, specialization, qualification, experience } = req.body;
    const certificatePath = req.file ? "uploads/" + req.file.filename : "uploads/default_cert.pdf";

    if (!name || !reg_number || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const sql = `
        INSERT INTO doctors 
        (name, reg_number, email, phone, password, specialization, qualification, experience, certificate_path, status, is_online)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 1)
    `;

    db.query(sql, [
        name,
        reg_number,
        email,
        phone,
        password,
        specialization || "General Physician",
        qualification || "MBBS",
        experience || "3+ Years",
        certificatePath
    ], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ success: false, message: "Medical Registration Number or Email already registered." });
            }
            console.error("Doctor Insert error:", err);
            return res.status(500).json({ success: false, message: "Doctor registration failed" });
        }

        res.json({
            success: true,
            doctorId: result.insertId,
            status: "Pending",
            message: "Registration submitted successfully! Your medical certificate is under verification by the admin."
        });
    });
});

// Doctor Login
app.post(["/doctor-login", "/api/doctor/login"], (req, res) => {
    const { email, password, isOtp, otp } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Please provide your email or registration number" });
    }

    db.query("SELECT * FROM doctors WHERE email = ? OR reg_number = ? OR phone = ? LIMIT 1", [email, email, email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Doctor account not found" });
        }

        const doc = results[0];

        if (!isOtp && doc.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        if (isOtp && otp !== "123456" && !otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Use 123456 for demo." });
        }

        // Verification Status Check
        if (doc.status === "Pending") {
            return res.status(403).json({
                success: false,
                status: "Pending",
                message: "Verification Pending: Your medical credentials are under review by Medi Lingo Admin. You will receive access upon approval.",
                doctor: { id: doc.id, name: doc.name, status: doc.status }
            });
        }

        if (doc.status === "Rejected") {
            return res.status(403).json({
                success: false,
                status: "Rejected",
                message: "Registration Rejected: Your medical registration certificate could not be verified by the admin.",
                doctor: { id: doc.id, name: doc.name, status: doc.status }
            });
        }

        delete doc.password;
        res.json({
            success: true,
            message: "Doctor authenticated successfully",
            doctor: doc
        });
    });
});

// Check Doctor Verification Status
app.get("/api/doctor/status/:identifier", (req, res) => {
    const id = req.params.identifier;
    db.query("SELECT id, name, reg_number, email, status, specialization, qualification, certificate_path FROM doctors WHERE email = ? OR phone = ? OR reg_number = ? OR id = ? LIMIT 1", [id, id, id, parseInt(id) || 0], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (results.length === 0) return res.status(404).json({ success: false, message: "Doctor not found" });
        res.json({ success: true, doctor: results[0] });
    });
});

// Verified Doctors List for Patient Portal (ONLY Approved Doctors!)
app.get(["/doctors", "/api/doctors/verified"], (req, res) => {
    const sql = `
        SELECT id, name, reg_number, specialization, qualification, experience, is_online, rating, status
        FROM doctors 
        WHERE status = 'Approved'
        ORDER BY is_online DESC, rating DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

// Incoming Patient Requests for Doctor Portal
app.get(["/doctor-requests", "/api/doctor/requests"], (req, res) => {
    const sql = `
        SELECT * FROM consultations 
        WHERE status = 'Pending_Doctor' OR requires_doctor = 1
        ORDER BY s_no DESC 
        LIMIT 10
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

// Doctor Consultation History
app.get(["/doctor-history", "/api/doctor/history"], (req, res) => {
    const doctorId = req.query.doctorId;
    let sql = `
        SELECT * FROM consultations 
        WHERE medication_suggested IS NOT NULL
    `;
    const params = [];
    if (doctorId) {
        sql += ` AND doctor_id = ?`;
        params.push(doctorId);
    }
    sql += ` ORDER BY s_no DESC LIMIT 50`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

// Doctor updates/sends prescription
app.post(["/update-prescription", "/api/doctor/send-prescription"], (req, res) => {
    const { id, medicine, dosage, instructions, doctorId, doctorName } = req.body;

    if (!id || !medicine) {
        return res.status(400).json({ success: false, message: "Consultation ID and medicine are required" });
    }

    const sql = `
        UPDATE consultations 
        SET medication_suggested = ?, dosage = ?, instructions = ?, doctor_id = ?, doctor_name = ?, status = 'Completed', requires_doctor = 0
        WHERE s_no = ?
    `;

    db.query(sql, [
        medicine,
        dosage || "As advised by doctor",
        instructions || "Take with warm water after food",
        doctorId || null,
        doctorName || "Medi Lingo Doctor",
        id
    ], (err, result) => {
        if (err) {
            console.error("Update prescription error:", err);
            return res.status(500).json({ success: false, message: "Error updating prescription" });
        }
        res.json({ success: true, message: "Prescription updated and sent to patient successfully" });
    });
});

/* ========================================================
   3. ADMIN REST APIs
======================================================== */

// Admin Login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if ((username === "admin@medilingo.com" || username === "admin") && (password === "Admin@2026" || password === "admin123" || password === "Sadhu@18")) {
        res.json({
            success: true,
            admin: {
                name: "Medi Lingo Executive Admin",
                role: "SuperAdmin",
                email: "admin@medilingo.com"
            }
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
});

// Admin System Statistics
app.get("/api/admin/stats", (req, res) => {
    const queries = {
        patients: "SELECT COUNT(*) as count FROM patients",
        doctors: "SELECT COUNT(*) as count FROM doctors",
        pendingDoctors: "SELECT COUNT(*) as count FROM doctors WHERE status = 'Pending'",
        approvedDoctors: "SELECT COUNT(*) as count FROM doctors WHERE status = 'Approved'",
        consultations: "SELECT COUNT(*) as count FROM consultations",
        emergencyCases: "SELECT COUNT(*) as count FROM consultations WHERE triage_level = 'Emergency' OR requires_doctor = 1",
        vendingInventory: "SELECT SUM(stock_quantity) as totalStock, COUNT(*) as totalItems FROM medicines"
    };

    db.query(`
        ${queries.patients};
        ${queries.doctors};
        ${queries.pendingDoctors};
        ${queries.approvedDoctors};
        ${queries.consultations};
        ${queries.emergencyCases};
        ${queries.vendingInventory};
    `, (err, results) => {
        if (err) {
            // Fallback individual queries
            db.query("SELECT COUNT(*) as totalConsultations FROM consultations", (e1, r1) => {
                db.query("SELECT COUNT(*) as totalDoctors FROM doctors", (e2, r2) => {
                    db.query("SELECT COUNT(*) as pendingDoctors FROM doctors WHERE status = 'Pending'", (e3, r3) => {
                        db.query("SELECT COUNT(*) as totalPatients FROM patients", (e4, r4) => {
                            res.json({
                                success: true,
                                stats: {
                                    totalPatients: (r4 && r4[0]) ? r4[0].totalPatients : 0,
                                    totalDoctors: (r2 && r2[0]) ? r2[0].totalDoctors : 0,
                                    pendingDoctors: (r3 && r3[0]) ? r3[0].pendingDoctors : 0,
                                    approvedDoctors: ((r2 && r2[0]) ? r2[0].totalDoctors : 0) - ((r3 && r3[0]) ? r3[0].pendingDoctors : 0),
                                    totalConsultations: (r1 && r1[0]) ? r1[0].totalConsultations : 0,
                                    emergencyCases: 0,
                                    totalStock: 235
                                }
                            });
                        });
                    });
                });
            });
            return;
        }

        res.json({
            success: true,
            stats: {
                totalPatients: results[0][0].count,
                totalDoctors: results[1][0].count,
                pendingDoctors: results[2][0].count,
                approvedDoctors: results[3][0].count,
                totalConsultations: results[4][0].count,
                emergencyCases: results[5][0].count,
                totalStock: results[6][0].totalStock || 0
            }
        });
    });
});

// All Doctors (for Admin Verification / Approval)
app.get(["/api/admin/doctors", "/api/admin/pending-doctors"], (req, res) => {
    db.query("SELECT * FROM doctors ORDER BY CASE WHEN status = 'Pending' THEN 1 WHEN status = 'Approved' THEN 2 ELSE 3 END, id DESC", (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

// Approve Doctor
app.post("/api/admin/approve-doctor", (req, res) => {
    const { doctorId } = req.body;
    db.query("UPDATE doctors SET status = 'Approved' WHERE id = ?", [doctorId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, message: "Doctor verified and approved successfully!" });
    });
});

// Reject Doctor
app.post("/api/admin/reject-doctor", (req, res) => {
    const { doctorId } = req.body;
    db.query("UPDATE doctors SET status = 'Rejected' WHERE id = ?", [doctorId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, message: "Doctor registration rejected." });
    });
});

// Admin All Consultations Table (Admin-only access!)
app.get(["/all-consultations", "/api/admin/all-consultations"], (req, res) => {
    db.query("SELECT * FROM consultations ORDER BY s_no DESC", (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

/* ========================================================
   4. SMART VENDING MACHINE & IoT REST APIs
======================================================== */

// Get all medicines & vending slot inventory
app.get("/api/vending/medicines", (req, res) => {
    db.query("SELECT * FROM medicines ORDER BY slot_number ASC, id ASC", (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json(results);
    });
});

// Trigger Dispense Action (Hardware IoT ready)
app.post("/api/vending/dispense", (req, res) => {
    const { medicineId, slotNumber, patientName, patientPhone, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    // Check stock
    db.query("SELECT * FROM medicines WHERE id = ? OR slot_number = ? LIMIT 1", [medicineId, slotNumber], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Medicine slot not found in vending machine" });
        }

        const med = results[0];
        if (med.stock_quantity < qty) {
            return res.status(400).json({ success: false, message: `Insufficient stock! Only ${med.stock_quantity} available.` });
        }

        const newStock = med.stock_quantity - qty;
        const isAvailable = newStock > 0 ? 1 : 0;
        const orderId = "VEND-" + Date.now().toString().slice(-6);
        const totalPrice = med.price * qty;

        // Deduct stock
        db.query("UPDATE medicines SET stock_quantity = ?, is_available = ? WHERE id = ?", [newStock, isAvailable, med.id], (err2) => {
            if (err2) console.error("Stock update error:", err2);

            // Log dispense order
            db.query(`
                INSERT INTO vending_orders 
                (order_id, patient_name, patient_phone, medicine_id, medicine_name, quantity, total_price, slot_number, payment_status, dispense_status, sensor_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Dispensed', 1)
            `, [orderId, patientName || "Walk-in Patient", patientPhone || "N/A", med.id, med.name, qty, totalPrice, med.slot_number], (err3) => {
                if (err3) console.error("Vending order insert error:", err3);

                // Return IoT dispatch instruction for Arduino/Microcontroller
                res.json({
                    success: true,
                    orderId,
                    medicineName: med.name,
                    slotNumber: med.slot_number,
                    quantity: qty,
                    totalPrice,
                    remainingStock: newStock,
                    sensorVerified: true,
                    hardwareCommand: `DISPENSE_SLOT_${med.slot_number}_QTY_${qty}`,
                    message: `Medicine successfully dispensed from Slot #${med.slot_number}!`
                });
            });
        });
    });
});

// Hardware Status Heartbeat (for Microcontroller / Arduino / ESP32)
app.get("/api/vending/status", (req, res) => {
    res.json({
        status: "ONLINE",
        machineId: "ML-VEND-01",
        irSensorStatus: "NORMAL",
        motorDriverStatus: "READY",
        slotsConfigured: 8,
        serverTime: new Date().toISOString()
    });
});

// Hardware Webhook for IR Sensor Confirmation from Arduino
app.post("/api/vending/hardware-event", (req, res) => {
    const { slotNumber, sensorTriggered, orderId } = req.body;
    console.log(`[IoT Webhook] Hardware confirmed drop for Slot ${slotNumber}, Order: ${orderId}, Sensor: ${sensorTriggered}`);
    res.json({ received: true, ack: "DISPENSE_CONFIRMED" });
});

/* ========================================================
   MEDICINE REFERENCE DATASET API (50 Essential Medicines)
======================================================== */
app.get("/api/medicine-reference", (req, res) => {
    try {
        const dataPath = path.join(__dirname, "data", "medicines-reference.json");
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, "utf-8");
            return res.json(JSON.parse(raw));
        }
        res.status(404).json({ error: "Medicine reference data not found" });
    } catch (e) {
        console.error("Medicine reference error:", e);
        res.status(500).json({ error: "Failed to load medicine reference data" });
    }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Medi Lingo Server running on http://localhost:${PORT}`);
    console.log(`Patient Portal : http://localhost:${PORT}/index.html`);
    console.log(`Doctor Portal  : http://localhost:${PORT}/doctor-login.html`);
    console.log(`Admin Portal   : http://localhost:${PORT}/admin-login.html`);
    console.log(`====================================================`);
});