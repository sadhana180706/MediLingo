const mysql = require("mysql2");

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "Sadhu@18",
    database: "medilingo",
    multipleStatements: true
};

const initSchema = `
-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_uid VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    age INT,
    gender VARCHAR(20) DEFAULT 'Not specified',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) DEFAULT 'General Physician',
    qualification VARCHAR(100) DEFAULT 'MBBS, MD',
    experience VARCHAR(50) DEFAULT '5+ Years',
    certificate_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending',
    is_online TINYINT(1) DEFAULT 1,
    rating DECIMAL(2,1) DEFAULT 4.8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
    s_no INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50),
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20) DEFAULT 'Not specified',
    phn_num VARCHAR(20),
    language VARCHAR(50) DEFAULT 'English',
    symptom TEXT,
    detected_symptoms TEXT,
    ai_confidence VARCHAR(20) DEFAULT 'High',
    triage_level VARCHAR(20) DEFAULT 'Mild',
    requires_doctor TINYINT(1) DEFAULT 0,
    medication_suggested VARCHAR(255),
    dosage VARCHAR(255),
    instructions TEXT,
    doctor_id INT NULL,
    doctor_name VARCHAR(100) NULL,
    status VARCHAR(30) DEFAULT 'Completed',
    last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Medicines Table (Smart Vending Machine Stock)
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    category VARCHAR(50),
    dosage_form VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 20,
    slot_number INT UNIQUE,
    is_available TINYINT(1) DEFAULT 1,
    description TEXT,
    usage_instructions TEXT
);

-- 5. Vending Orders / Dispense Logs
CREATE TABLE IF NOT EXISTS vending_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE,
    patient_name VARCHAR(100),
    patient_phone VARCHAR(20),
    medicine_id INT,
    medicine_name VARCHAR(100),
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2),
    slot_number INT,
    payment_status VARCHAR(20) DEFAULT 'Paid',
    dispense_status VARCHAR(30) DEFAULT 'Dispensed',
    sensor_verified TINYINT(1) DEFAULT 1,
    dispensed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedData = async (conn) => {
    // Check if approved doctors exist
    const [approvedDocs] = await conn.promise().query("SELECT COUNT(*) as count FROM doctors WHERE status = 'Approved'");
    if (approvedDocs[0].count === 0) {
        console.log("Seeding approved doctors...");
        const doctorSeeds = [
            ["Dr. Arvind Swaminathan", "TNMC-84920", "dr.arvind@medilingo.com", "9840112233", "Doctor@123", "General Medicine", "MBBS, MD (Internal Med)", "12 Years", "uploads/default_cert.pdf", "Approved", 1, 4.9],
            ["Dr. Priya Nandakumar", "TNMC-91244", "dr.priya@medilingo.com", "9840223344", "Doctor@123", "Pediatrics & Child Care", "MBBS, DCH, DNB", "9 Years", "uploads/default_cert.pdf", "Approved", 1, 4.8],
            ["Dr. Rajesh Sharma", "DMC-67312", "dr.rajesh@medilingo.com", "9811334455", "Doctor@123", "Pulmonology & Chest", "MBBS, MD (Pulmonology)", "15 Years", "uploads/default_cert.pdf", "Approved", 1, 4.9],
            ["Dr. Ananya Reddy", "APMC-55421", "dr.ananya@medilingo.com", "9849445566", "Doctor@123", "Dermatology", "MBBS, MD (DVL)", "7 Years", "uploads/default_cert.pdf", "Approved", 0, 4.7]
        ];
        for (const doc of doctorSeeds) {
            try {
                await conn.promise().query(
                    "INSERT INTO doctors (name, reg_number, email, phone, password, specialization, qualification, experience, certificate_path, status, is_online, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    doc
                );
            } catch (err) {
                console.log("Doctor insert note:", err.message);
            }
        }
    }

    // Check if medicines has seed
    const [meds] = await conn.promise().query("SELECT COUNT(*) as count FROM medicines");
    if (meds[0].count === 0) {
        console.log("Seeding initial smart vending machine medicines...");
        const medSeeds = [
            ["Paracetamol 500mg", "Acetaminophen", "Analgesic / Antipyretic", "10 Tablets / Strip", 25.00, 45, 1, 1, "Relief from fever, headache, and mild to moderate pain.", "1 tablet every 6-8 hours after food as needed."],
            ["Cetirizine 10mg", "Cetirizine Hydrochloride", "Antihistamine", "10 Tablets / Strip", 35.00, 30, 2, 1, "Relief from cold, runny nose, allergic rhinitis, and sneezing.", "1 tablet once daily at bedtime."],
            ["Ibuprofen 400mg", "Ibuprofen", "NSAID / Pain Relief", "10 Tablets / Strip", 40.00, 0, 3, 0, "Anti-inflammatory painkiller for muscle pain, dental pain, arthritis.", "1 tablet after meals with plenty of water. Avoid on empty stomach."],
            ["ORS Electral Sachet", "Oral Rehydration Salts", "Electrolyte Solution", "21.8g Sachet", 22.00, 60, 4, 1, "Rapid hydration and electrolyte replenishment for diarrhoea or vomiting.", "Dissolve entire sachet in 1 Litre of clean drinking water."],
            ["Ambroxol 30mg", "Ambroxol Hydrochloride", "Mucolytic / Cough", "10 Tablets / Strip", 45.00, 25, 5, 1, "Breaks down mucus and relieves productive wet cough.", "1 tablet twice daily after food."],
            ["Antacid Chewable", "Aluminium & Magnesium Hydroxide", "Antacid", "10 Chewable Tabs", 30.00, 35, 6, 1, "Instant relief from acidity, heartburn, and stomach gastric irritation.", "Chew 1-2 tablets 30 mins after meals or when feeling heartburn."],
            ["Calamine Lotion 50ml", "Calamine & Zinc Oxide", "Topical Soothing", "50ml Bottle", 55.00, 18, 7, 1, "Soothes skin rashes, sunburn, insect bites, and allergic itching.", "Apply thin layer gently to clean affected skin area."],
            ["Povidone Iodine Ointment", "Povidone Iodine 5% w/w", "First Aid Antiseptic", "15g Tube", 48.00, 22, 8, 1, "Topical antiseptic for minor cuts, wounds, scratches, and scrapes.", "Clean wound with water and apply a thin layer before bandaging."]
        ];
        for (const m of medSeeds) {
            await conn.promise().query(
                "INSERT INTO medicines (name, generic_name, category, dosage_form, price, stock_quantity, slot_number, is_available, description, usage_instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                m
            );
        }
    }
};

function runInit() {
    const conn = mysql.createConnection(dbConfig);
    conn.connect(async (err) => {
        if (err) {
            console.error("Init failed to connect:", err.message);
            process.exit(1);
        }
        console.log("Connected to MySQL. Setting up schema...");
        
        try {
            await conn.promise().query(initSchema);
            console.log("Schema initialized successfully!");
            
            // Check if any missing columns exist on doctors or consultations and add them safely
            const [docCols] = await conn.promise().query("DESCRIBE doctors");
            const docColNames = docCols.map(c => c.Field);
            if (!docColNames.includes("specialization")) {
                await conn.promise().query("ALTER TABLE doctors ADD COLUMN specialization VARCHAR(100) DEFAULT 'General Physician'");
            }
            if (!docColNames.includes("qualification")) {
                await conn.promise().query("ALTER TABLE doctors ADD COLUMN qualification VARCHAR(100) DEFAULT 'MBBS, MD'");
            }
            if (!docColNames.includes("experience")) {
                await conn.promise().query("ALTER TABLE doctors ADD COLUMN experience VARCHAR(50) DEFAULT '5+ Years'");
            }
            if (!docColNames.includes("is_online")) {
                await conn.promise().query("ALTER TABLE doctors ADD COLUMN is_online TINYINT(1) DEFAULT 1");
            }
            if (!docColNames.includes("rating")) {
                await conn.promise().query("ALTER TABLE doctors ADD COLUMN rating DECIMAL(2,1) DEFAULT 4.8");
            }

            const [consultCols] = await conn.promise().query("DESCRIBE consultations");
            const consultColNames = consultCols.map(c => c.Field);
            if (!consultColNames.includes("language")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN language VARCHAR(50) DEFAULT 'English'");
            }
            if (!consultColNames.includes("detected_symptoms")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN detected_symptoms TEXT");
            }
            if (!consultColNames.includes("ai_confidence")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN ai_confidence VARCHAR(20) DEFAULT 'High'");
            }
            if (!consultColNames.includes("triage_level")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN triage_level VARCHAR(20) DEFAULT 'Mild'");
            }
            if (!consultColNames.includes("requires_doctor")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN requires_doctor TINYINT(1) DEFAULT 0");
            }
            if (!consultColNames.includes("dosage")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN dosage VARCHAR(255)");
            }
            if (!consultColNames.includes("instructions")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN instructions TEXT");
            }
            if (!consultColNames.includes("doctor_id")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN doctor_id INT NULL");
            }
            if (!consultColNames.includes("doctor_name")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN doctor_name VARCHAR(100) NULL");
            }
            if (!consultColNames.includes("status")) {
                await conn.promise().query("ALTER TABLE consultations ADD COLUMN status VARCHAR(30) DEFAULT 'Completed'");
            }

            await seedData(conn);
            console.log("Database setup & seeds complete!");
            conn.end();
            process.exit(0);
        } catch (e) {
            console.error("Migration error:", e);
            conn.end();
            process.exit(1);
        }
    });
}

runInit();
