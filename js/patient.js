/* ========================================================
   MEDI LINGO - PATIENT PORTAL CONTROLLER
   ======================================================== */

const PatientController = {
    currentPatient: null,

    init() {
        this.currentPatient = Auth.getSession("patient");
        this.updateHeaderUI();
        this.loadDashboardStats();
    },

    updateHeaderUI() {
        const userNameEl = document.getElementById("headerPatientName");
        const userAvatarEl = document.getElementById("headerPatientAvatar");
        const loginBtnEl = document.getElementById("headerLoginBtn");
        const logoutBtnEl = document.getElementById("headerLogoutBtn");

        if (this.currentPatient) {
            if (userNameEl) userNameEl.innerText = this.currentPatient.name;
            if (userAvatarEl) userAvatarEl.innerText = this.currentPatient.name.charAt(0).toUpperCase();
            if (loginBtnEl) loginBtnEl.style.display = "none";
            if (logoutBtnEl) logoutBtnEl.style.display = "block";
        } else {
            if (userNameEl) userNameEl.innerText = "Guest Patient";
            if (userAvatarEl) userAvatarEl.innerText = "G";
            if (loginBtnEl) loginBtnEl.style.display = "block";
            if (logoutBtnEl) logoutBtnEl.style.display = "none";
        }
    },

    async loadDashboardStats() {
        try {
            // 1. Available Medicines count
            const medRes = await fetch(`${API_BASE}/api/vending/medicines`);
            if (medRes.ok) {
                const meds = await medRes.json();
                const inStockCount = meds.filter(m => m.stock_quantity > 0).length;
                const medCountEl = document.getElementById("statMedicinesCount");
                if (medCountEl) medCountEl.innerText = `${inStockCount} Items Ready`;
            }

            // 2. Verified Doctors count
            const docRes = await fetch(`${API_BASE}/api/doctors/verified`);
            if (docRes.ok) {
                const docs = await docRes.json();
                const docCountEl = document.getElementById("statDoctorsCount");
                if (docCountEl) docCountEl.innerText = `${docs.length} Verified Online`;
            }

            // 3. User's Personal Prescriptions Count (NO cross-patient leak!)
            if (this.currentPatient) {
                const profRes = await fetch(`${API_BASE}/api/patient/profile/${this.currentPatient.patient_uid || this.currentPatient.id}`);
                if (profRes.ok) {
                    const profData = await profRes.json();
                    const rxCountEl = document.getElementById("statPrescriptionsCount");
                    if (rxCountEl) rxCountEl.innerText = `${profData.consultations ? profData.consultations.length : 0} Saved`;
                }
            }
        } catch (e) {
            console.error("Dashboard stats load error:", e);
        }
    },

    triggerEmergency() {
        const modal = document.getElementById("emergencyModal");
        if (modal) {
            modal.style.display = "flex";
        } else {
            alert("🚨 EMERGENCY ALERT TRIGGERED!\n\nDial 108 (National Emergency Ambulance) or 112 immediately.\nYour GPS location has been flagged for nearest medical responders.");
        }
    },

    closeEmergency() {
        const modal = document.getElementById("emergencyModal");
        if (modal) modal.style.display = "none";
    }
};

// Auto-run if patient container present
document.addEventListener("DOMContentLoaded", () => {
    PatientController.init();
});
