/* ========================================================
   MEDI LINGO - ADMIN PORTAL CONTROLLER
   ======================================================== */

const AdminController = {
    currentAdmin: null,
    allConsultationsData: [],

    init() {
        this.currentAdmin = Auth.getSession("admin");
        if (this.currentAdmin) {
            const adminNameEl = document.getElementById("adminDisplayName");
            if (adminNameEl) adminNameEl.innerText = this.currentAdmin.name;
        }
    },

    guardAdmin() {
        const admin = Auth.getSession("admin");
        if (!admin) {
            window.location.href = "admin-login.html";
            return null;
        }
        this.currentAdmin = admin;
        return admin;
    },

    async loadStats() {
        try {
            const res = await fetch(`${API_BASE}/api/admin/stats`);
            const data = await res.json();
            if (data.success && data.stats) {
                const s = data.stats;
                if (document.getElementById("statTotalPatients")) document.getElementById("statTotalPatients").innerText = s.totalPatients;
                if (document.getElementById("statTotalDoctors")) document.getElementById("statTotalDoctors").innerText = s.totalDoctors;
                if (document.getElementById("statPendingDoctors")) document.getElementById("statPendingDoctors").innerText = s.pendingDoctors;
                if (document.getElementById("statTotalConsultations")) document.getElementById("statTotalConsultations").innerText = s.totalConsultations;
                if (document.getElementById("statEmergencyCases")) document.getElementById("statEmergencyCases").innerText = s.emergencyCases;
                if (document.getElementById("statTotalStock")) document.getElementById("statTotalStock").innerText = s.totalStock;
            }
        } catch (e) {
            console.error("Stats load error:", e);
        }
    },

    async loadPendingDoctors() {
        const container = document.getElementById("doctorApprovalTableBody");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/admin/doctors`);
            const doctors = await res.json();

            if (doctors.length === 0) {
                container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No doctor registrations found.</td></tr>`;
                return;
            }

            let html = "";
            doctors.forEach(doc => {
                const isPending = doc.status === "Pending";
                const isApproved = doc.status === "Approved";
                const badgeClass = isApproved ? "approved" : (isPending ? "pending" : "rejected");
                const certLink = doc.certificate_path ? `${API_BASE}/${doc.certificate_path}` : "#";

                html += `
                    <tr>
                        <td>
                            <strong>${doc.name}</strong><br>
                            <span style="font-size:11.5px; color:var(--text-muted);">${doc.specialization || 'General Physician'}</span>
                        </td>
                        <td><code style="background:var(--bg-input); padding:2px 6px; border-radius:4px; font-size:12px; color:var(--teal);">${doc.reg_number}</code></td>
                        <td>${doc.email}<br><span style="font-size:11.5px; color:var(--text-muted);">${doc.phone}</span></td>
                        <td>${doc.qualification || 'MBBS'} (${doc.experience || '3+ yrs'})</td>
                        <td>
                            <a href="${certLink}" target="_blank" class="btn btn-secondary btn-sm" style="padding:4px 10px; font-size:12px;">
                                📄 View Certificate
                            </a>
                        </td>
                        <td>
                            <span class="status-badge ${badgeClass}">${doc.status}</span>
                        </td>
                        <td>
                            <div style="display:flex; gap:6px;">
                                ${isPending ? `
                                    <button class="btn btn-success btn-sm" onclick="AdminController.approveDoctor(${doc.id})">Approve</button>
                                    <button class="btn btn-danger btn-sm" onclick="AdminController.rejectDoctor(${doc.id})">Reject</button>
                                ` : (isApproved ? `
                                    <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:11px;" onclick="AdminController.rejectDoctor(${doc.id})">Revoke</button>
                                ` : `
                                    <button class="btn btn-success btn-sm" style="padding:4px 8px; font-size:11px;" onclick="AdminController.approveDoctor(${doc.id})">Re-Approve</button>
                                `)}
                            </div>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            console.error("Pending doctors load error:", e);
        }
    },

    async approveDoctor(doctorId) {
        try {
            const res = await fetch(`${API_BASE}/api/admin/approve-doctor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId })
            });
            const data = await res.json();
            if (data.success) {
                Auth.showToast("Doctor verified & approved! Now visible to patients.", "success");
                this.loadPendingDoctors();
                this.loadStats();
            }
        } catch (e) {
            console.error("Approve error:", e);
        }
    },

    async rejectDoctor(doctorId) {
        if (!confirm("Are you sure you want to reject this doctor application?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/reject-doctor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId })
            });
            const data = await res.json();
            if (data.success) {
                Auth.showToast("Doctor status updated to Rejected.", "warning");
                this.loadPendingDoctors();
                this.loadStats();
            }
        } catch (e) {
            console.error("Reject error:", e);
        }
    },

    async loadAllConsultations() {
        const container = document.getElementById("adminConsultationsTableBody");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE}/api/admin/all-consultations`);
            const records = await res.json();
            this.allConsultationsData = records;
            this.renderConsultationsTable(records);
        } catch (e) {
            console.error("Consultations load error:", e);
        }
    },

    renderConsultationsTable(records) {
        const container = document.getElementById("adminConsultationsTableBody");
        if (!container) return;

        if (records.length === 0) {
            container.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">No consultation records found.</td></tr>`;
            return;
        }

        let html = "";
        records.forEach(r => {
            const isEmergency = r.triage_level === "Emergency";
            const triageBadge = isEmergency 
                ? `<span class="status-badge emergency">🚨 Emergency</span>` 
                : `<span class="status-badge approved">${r.triage_level || 'Mild'}</span>`;

            html += `
                <tr>
                    <td><strong>#${r.s_no}</strong></td>
                    <td><code style="color:var(--teal); font-size:12px;">${r.patient_id || 'N/A'}</code></td>
                    <td><strong>${r.name || 'Anonymous'}</strong><br><span style="font-size:11px; color:var(--text-muted);">${r.age || 'N/A'} yrs • ${r.gender || 'N/A'}</span></td>
                    <td>${r.phn_num || 'N/A'}<br><span style="font-size:11px; color:var(--text-muted);">${r.language || 'English'}</span></td>
                    <td style="max-width:200px;">${r.symptom || 'N/A'}</td>
                    <td><strong style="color:var(--teal);">${r.medication_suggested || 'Pending'}</strong><br><span style="font-size:11px; color:var(--text-muted);">${r.dosage || ''}</span></td>
                    <td>${triageBadge}</td>
                    <td>${r.doctor_name || 'AI Assistant'}</td>
                    <td style="font-size:12px; color:var(--text-muted);">${new Date(r.last_visited).toLocaleString()}</td>
                </tr>
            `;
        });
        container.innerHTML = html;
    },

    filterConsultations(query) {
        const q = (query || "").toLowerCase();
        const filtered = this.allConsultationsData.filter(r => 
            (r.name && r.name.toLowerCase().includes(q)) ||
            (r.patient_id && r.patient_id.toLowerCase().includes(q)) ||
            (r.symptom && r.symptom.toLowerCase().includes(q)) ||
            (r.medication_suggested && r.medication_suggested.toLowerCase().includes(q)) ||
            (r.phn_num && r.phn_num.includes(q))
        );
        this.renderConsultationsTable(filtered);
    },

    exportCSV() {
        if (this.allConsultationsData.length === 0) {
            alert("No records to export.");
            return;
        }

        const headers = ["S.No", "Patient ID", "Name", "Age", "Gender", "Phone", "Language", "Symptoms", "Medicine Suggested", "Dosage", "Triage Level", "Doctor", "Date"];
        const rows = this.allConsultationsData.map(r => [
            r.s_no,
            `"${r.patient_id || ''}"`,
            `"${r.name || ''}"`,
            r.age || '',
            r.gender || '',
            `"${r.phn_num || ''}"`,
            `"${r.language || ''}"`,
            `"${(r.symptom || '').replace(/"/g, '""')}"`,
            `"${(r.medication_suggested || '').replace(/"/g, '""')}"`,
            `"${(r.dosage || '').replace(/"/g, '""')}"`,
            r.triage_level || '',
            `"${r.doctor_name || ''}"`,
            `"${new Date(r.last_visited).toLocaleString()}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `medilingo_consultations_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
