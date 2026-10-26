/* ========================================================
   MEDI LINGO - DOCTOR PORTAL CONTROLLER
   ======================================================== */

const DoctorController = {
    currentDoctor: null,
    selectedConsultationId: null,

    init() {
        this.currentDoctor = Auth.getSession("doctor");
        this.updateDoctorHeader();
    },

    guardDashboard() {
        const doc = Auth.getSession("doctor");
        if (!doc) {
            window.location.href = "doctor-login.html";
            return null;
        }
        if (doc.status !== "Approved") {
            window.location.href = "doctor-certificate.html";
            return null;
        }
        this.currentDoctor = doc;
        this.updateDoctorHeader();
        return doc;
    },

    updateDoctorHeader() {
        if (!this.currentDoctor) return;
        const nameEls = document.querySelectorAll(".doc-name");
        nameEls.forEach(el => el.innerText = this.currentDoctor.name);
        
        const specEls = document.querySelectorAll(".doc-spec");
        specEls.forEach(el => el.innerText = this.currentDoctor.specialization || "General Physician");

        const regEls = document.querySelectorAll(".doc-reg");
        regEls.forEach(el => el.innerText = this.currentDoctor.reg_number);
    },

    async loadRequests() {
        const container = document.getElementById("requestsList");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/doctor/requests`);
            const requests = await res.json();

            if (requests.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
                        <div style="font-size: 36px; margin-bottom: 10px;">🩺</div>
                        <p>No pending patient requests right now. You are all caught up!</p>
                    </div>
                `;
                return;
            }

            let html = "";
            requests.forEach(req => {
                const isEmergency = req.triage_level === "Emergency";
                html += `
                    <div class="card" style="margin-bottom: 16px; border-left: 4px solid ${isEmergency ? 'var(--emergency)' : 'var(--teal)'};">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                            <div>
                                <h3 style="font-size: 16px; margin-bottom: 4px;">👤 ${req.name || 'Patient'} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${req.age || 'N/A'} yrs • ${req.gender || 'N/A'})</span></h3>
                                <span class="status-badge ${isEmergency ? 'emergency' : 'pending'}">${isEmergency ? '🚨 Emergency Triage' : '⏳ Teleconsultation Request'}</span>
                            </div>
                            <span style="font-size: 12px; color: var(--text-muted);">Language: <strong>${req.language || 'English'}</strong></span>
                        </div>

                        <div style="background: var(--bg-input); padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 14px;">
                            <span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">Reported Symptoms:</span>
                            <p style="margin: 0; font-size: 13.5px; color: var(--text-main);">${req.symptom}</p>
                        </div>

                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button class="btn btn-secondary btn-sm" onclick="DoctorController.declineRequest(${req.s_no})">Decline</button>
                            <button class="btn btn-primary btn-sm" onclick="DoctorController.openPrescriptionModal(${req.s_no}, '${encodeURIComponent(JSON.stringify(req))}')">Accept & Consult →</button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            console.error("Requests load error:", e);
        }
    },

    openPrescriptionModal(consultationId, reqDataStr) {
        this.selectedConsultationId = consultationId;
        const reqData = JSON.parse(decodeURIComponent(reqDataStr));
        
        const modal = document.getElementById("doctorPrescriptionModal");
        if (modal) {
            document.getElementById("modalPatientName").innerText = reqData.name || "Patient";
            document.getElementById("modalPatientInfo").innerText = `${reqData.age} yrs • ${reqData.gender} • Ph: ${reqData.phn_num}`;
            document.getElementById("modalSymptoms").innerText = reqData.symptom;
            modal.style.display = "flex";
        }
    },

    closePrescriptionModal() {
        const modal = document.getElementById("doctorPrescriptionModal");
        if (modal) modal.style.display = "none";
    },

    async submitPrescription() {
        const medicine = document.getElementById("rxMedicineInput").value.trim();
        const dosage = document.getElementById("rxDosageInput").value.trim();
        const instructions = document.getElementById("rxInstructionsInput").value.trim();

        if (!medicine) {
            alert("Please enter the prescribed medicine.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/doctor/send-prescription`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: this.selectedConsultationId,
                    medicine: medicine,
                    dosage: dosage || "As advised by doctor",
                    instructions: instructions || "Take after meals with warm water",
                    doctorId: this.currentDoctor ? this.currentDoctor.id : null,
                    doctorName: this.currentDoctor ? this.currentDoctor.name : "Dr. Medi Lingo"
                })
            });

            const data = await res.json();
            if (data.success) {
                Auth.showToast("Prescription issued and sent to patient!", "success");
                this.closePrescriptionModal();
                this.loadRequests();
                this.loadHistory();
            } else {
                alert("Error: " + data.message);
            }
        } catch (e) {
            console.error("Prescription submit error:", e);
            alert("Failed to submit prescription");
        }
    },

    async declineRequest(consultationId) {
        if (!confirm("Are you sure you want to decline this consultation request?")) return;
        Auth.showToast("Request declined", "warning");
        this.loadRequests();
    },

    async loadHistory() {
        const container = document.getElementById("doctorHistoryTableBody");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/doctor/history`);
            const history = await res.json();

            if (history.length === 0) {
                container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No completed consultations found.</td></tr>`;
                return;
            }

            let html = "";
            history.forEach((row, idx) => {
                html += `
                    <tr>
                        <td>#${row.s_no}</td>
                        <td><strong>${row.name || 'Patient'}</strong><br><span style="font-size:11px; color:var(--text-muted);">${row.age || 'N/A'} yrs • ${row.gender || ''}</span></td>
                        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${row.symptom}</td>
                        <td><strong style="color:var(--teal);">${row.medication_suggested}</strong><br><span style="font-size:11px; color:var(--text-muted);">${row.dosage || ''}</span></td>
                        <td><span class="status-badge approved">Prescribed</span></td>
                        <td>${new Date(row.last_visited).toLocaleDateString()}</td>
                    </tr>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            console.error("History load error:", e);
        }
    }
};
