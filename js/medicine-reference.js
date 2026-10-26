/**
 * MediLingo Healthcare Platform
 * Medicine Reference Controller
 * Handles Search, Category Filtering, Prescription Status Filtering,
 * Card Rendering, and Details Modal for the 50-Medicine Dataset.
 */

let allMedicineRecords = [];
let activeCategory = "All";
let activePrescriptionFilter = "All";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    initMedicineReference();
});

async function initMedicineReference() {
    try {
        // Load data from standalone JS dataset or fallback to JSON/API
        if (typeof MEDICINE_REFERENCE_DATA !== "undefined" && Array.isArray(MEDICINE_REFERENCE_DATA)) {
            allMedicineRecords = MEDICINE_REFERENCE_DATA;
        } else if (window.MEDICINE_REFERENCE_DATA && Array.isArray(window.MEDICINE_REFERENCE_DATA)) {
            allMedicineRecords = window.MEDICINE_REFERENCE_DATA;
        } else {
            const res = await fetch("data/medicines-reference.json");
            allMedicineRecords = await res.json();
        }

        renderCategoryPills();
        filterAndRenderMedicines();
    } catch (err) {
        console.error("Failed to initialize medicine reference:", err);
        const container = document.getElementById("medRefGrid");
        if (container) {
            container.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:48px 20px; color:var(--emergency); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
                    <div style="font-size:40px; margin-bottom:12px;">⚠️</div>
                    <h3>Unable to Load Medicine Dataset</h3>
                    <p style="color:var(--text-muted); max-width:480px; margin:8px auto 20px;">Could not retrieve the 50-medicine clinical reference records. Please check the network or reload the page.</p>
                    <button class="btn btn-secondary" onclick="initMedicineReference()">🔄 Retry Loading</button>
                </div>
            `;
        }
    }
}

/**
 * Extract unique categories and render category filter pills
 */
function renderCategoryPills() {
    const pillsContainer = document.getElementById("categoryPillsContainer");
    if (!pillsContainer) return;

    const categories = ["All", ...new Set(allMedicineRecords.map(m => m.category).filter(Boolean))];

    let html = "";
    categories.forEach(cat => {
        const count = cat === "All" 
            ? allMedicineRecords.length 
            : allMedicineRecords.filter(m => m.category === cat).length;
        const isActive = cat === activeCategory ? "active" : "";
        html += `
            <button class="category-pill-btn ${isActive}" onclick="setCategoryFilter('${cat}')" id="cat-pill-${encodeURIComponent(cat)}">
                <span>${cat}</span>
                <span style="opacity:0.75; font-size:11px;">(${count})</span>
            </button>
        `;
    });
    pillsContainer.innerHTML = html;
}

/**
 * Set active category and re-render
 */
function setCategoryFilter(category) {
    activeCategory = category;
    renderCategoryPills();
    filterAndRenderMedicines();
}

/**
 * Set active prescription status filter from dropdown
 */
function handlePrescriptionFilter(val) {
    activePrescriptionFilter = val;
    filterAndRenderMedicines();
}

/**
 * Handle live search input
 */
function handleSearchInput(val) {
    searchQuery = (val || "").trim().toLowerCase();
    const clearBtn = document.getElementById("clearSearchBtn");
    if (clearBtn) {
        clearBtn.style.display = searchQuery.length > 0 ? "block" : "none";
    }
    filterAndRenderMedicines();
}

/**
 * Clear search input
 */
function clearSearch() {
    const input = document.getElementById("medRefSearchInput");
    if (input) {
        input.value = "";
        input.focus();
    }
    handleSearchInput("");
}

/**
 * Filters the 50 records by query, category, and prescription status
 */
function filterAndRenderMedicines() {
    const container = document.getElementById("medRefGrid");
    const countBadge = document.getElementById("resultsCountBadge");
    if (!container) return;

    let filtered = allMedicineRecords.filter(item => {
        // Category match
        if (activeCategory !== "All" && item.category !== activeCategory) {
            return false;
        }

        // Prescription status match
        if (activePrescriptionFilter === "OTC" && item.prescription_required) {
            return false;
        }
        if (activePrescriptionFilter === "Rx" && !item.prescription_required) {
            return false;
        }

        // Search match (Problem, Symptom, Medicine name)
        if (searchQuery) {
            const prob = (item.problem || "").toLowerCase();
            const symp = (item.symptoms || "").toLowerCase();
            const med = (item.medicine || "").toLowerCase();
            const ind = (item.indication || "").toLowerCase();
            const type = (item.medicine_type || "").toLowerCase();

            const matchProblem = prob.includes(searchQuery);
            const matchSymptom = symp.includes(searchQuery);
            const matchMedicine = med.includes(searchQuery);
            const matchIndication = ind.includes(searchQuery);
            const matchType = type.includes(searchQuery);

            if (!matchProblem && !matchSymptom && !matchMedicine && !matchIndication && !matchType) {
                return false;
            }
        }

        return true;
    });

    if (countBadge) {
        countBadge.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${allMedicineRecords.length}</strong> reference records`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:50px 20px; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
                <div style="font-size:42px; margin-bottom:12px;">🔍</div>
                <h3 style="font-size:18px; margin-bottom:8px;">No matching medicines found</h3>
                <p style="color:var(--text-muted); font-size:13.5px; max-width:450px; margin:0 auto 16px;">
                    We couldn't find any medicine records matching "${escapeHtml(searchQuery)}". Try searching by common problem (e.g., Fever, Asthma, Hypertension), symptom, or generic medicine name.
                </p>
                <button class="btn btn-secondary btn-sm" onclick="clearSearch()">Clear Filters</button>
            </div>
        `;
        return;
    }

    let html = "";
    filtered.forEach(item => {
        const isRx = item.prescription_required;
        const rxClass = isRx ? "rx-required" : (item.prescription_status.includes("OTC") ? "otc" : "clinical-guidance");
        const rxLabel = isRx ? "Prescription (Rx)" : (item.prescription_status.includes("OTC") ? "OTC Available" : "Clinical Guidance");
        const rxIcon = isRx ? "🔒" : "🟢";

        html += `
            <article class="med-card" id="med-card-${item.id}">
                <div>
                    <div class="med-card-header">
                        <span class="problem-badge">
                            🩺 ${escapeHtml(item.problem)}
                        </span>
                        <span class="rx-badge ${rxClass}">
                            ${rxIcon} ${escapeHtml(rxLabel)}
                        </span>
                    </div>

                    <h3 class="med-name-title">
                        💊 ${escapeHtml(item.medicine)}
                    </h3>
                    <div class="med-type-subtitle">
                        ${escapeHtml(item.medicine_type)}
                    </div>

                    <div class="med-card-body">
                        <div>
                            <div class="med-field-label">Symptoms / Condition</div>
                            <div class="med-field-value">${escapeHtml(item.symptoms)}</div>
                        </div>
                        <div>
                            <div class="med-field-label">Clinical Indication</div>
                            <div class="med-field-value">${escapeHtml(item.indication)}</div>
                        </div>
                    </div>

                    <div class="who-ref-chip">
                        <span>🏛️</span>
                        <span><strong>WHO Reference:</strong> ${escapeHtml(item.who_reference)}</span>
                    </div>
                </div>

                <div class="med-card-footer">
                    <button class="btn btn-secondary btn-block" style="font-size:13.5px; padding:10px 16px;" onclick="openMedicineDetails(${item.id})">
                        🔍 View Details
                    </button>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
}

/**
 * Opens modal with complete medicine details
 */
function openMedicineDetails(id) {
    const item = allMedicineRecords.find(m => m.id === id);
    if (!item) return;

    const modal = document.getElementById("medicineDetailModal");
    const container = document.getElementById("medicineDetailContent");
    if (!modal || !container) return;

    const isRx = item.prescription_required;
    const rxClass = isRx ? "rx-required" : (item.prescription_status.includes("OTC") ? "otc" : "clinical-guidance");
    const rxLabel = item.prescription_status || (isRx ? "Prescription Required (Rx)" : "Over-The-Counter (OTC)");

    container.innerHTML = `
        <div class="med-detail-header">
            <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
                    <span class="problem-badge">🩺 Problem: ${escapeHtml(item.problem)}</span>
                    <span class="rx-badge ${rxClass}">📜 ${escapeHtml(rxLabel)}</span>
                </div>
                <h2 style="font-size:24px; color:var(--text-main); margin-bottom:4px;">💊 ${escapeHtml(item.medicine)}</h2>
                <p style="font-size:14px; color:var(--teal); margin:0;">${escapeHtml(item.medicine_type)}</p>
            </div>
            <button class="med-detail-close-btn" onclick="closeMedicineDetails()" aria-label="Close modal">✕</button>
        </div>

        <div class="med-detail-grid">
            <div class="med-detail-item">
                <div class="med-field-label">Primary Health Problem</div>
                <div class="med-field-value" style="font-weight:600; color:var(--teal);">${escapeHtml(item.problem)}</div>
            </div>

            <div class="med-detail-item">
                <div class="med-field-label">Therapeutic Category</div>
                <div class="med-field-value">${escapeHtml(item.category || item.medicine_type)}</div>
            </div>

            <div class="med-detail-item full-width">
                <div class="med-field-label">Associated Symptoms</div>
                <div class="med-field-value">${escapeHtml(item.symptoms)}</div>
            </div>

            <div class="med-detail-item full-width">
                <div class="med-field-label">Clinical Indication & Uses</div>
                <div class="med-field-value">${escapeHtml(item.indication)}</div>
            </div>

            <div class="med-detail-item full-width">
                <div class="med-field-label">WHO Essential Medicines Reference (2025)</div>
                <div class="med-field-value" style="color:#60A5FA;">🏛️ ${escapeHtml(item.who_reference)}</div>
            </div>

            <div class="med-detail-item full-width">
                <div class="med-field-label">Prescription Requirement Status</div>
                <div class="med-field-value" style="font-weight:600;">
                    ${isRx 
                        ? `<span style="color:var(--emergency);">⚠️ Mandatory Prescription Required (Rx) — Do not take without certified medical consultation.</span>` 
                        : `<span style="color:var(--success);">✅ Generally available Over-The-Counter (OTC) / Follow package guidance.</span>`
                    }
                </div>
            </div>
        </div>

        <div class="safety-note-box">
            <h5>⚠️ Clinical Safety & Usage Note</h5>
            <p>${escapeHtml(item.safety_note)}</p>
        </div>

        <div style="margin-top:16px; padding:12px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-md); font-size:12px; color:var(--text-muted); line-height:1.45;">
            ℹ️ <strong>Educational Disclaimer:</strong> This dataset is for educational reference only. MediLingo does not diagnose or prescribe medications automatically. Always consult a licensed doctor or pharmacist before taking any medication.
        </div>

        <div style="display:flex; gap:12px; margin-top:20px;">
            <button class="btn btn-secondary btn-block" onclick="closeMedicineDetails()">Close</button>
            <a href="consult.html" class="btn btn-primary btn-block">🩺 Consult a Doctor</a>
        </div>
    `;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeMedicineDetails() {
    const modal = document.getElementById("medicineDetailModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Close on backdrop click
window.addEventListener("click", (e) => {
    const modal = document.getElementById("medicineDetailModal");
    if (e.target === modal) {
        closeMedicineDetails();
    }
});

// Close on Escape key
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeMedicineDetails();
    }
});

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
