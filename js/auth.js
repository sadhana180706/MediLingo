/* ========================================================
   MEDI LINGO - AUTHENTICATION & SESSION HELPER
   ======================================================== */

const API_BASE = "http://localhost:5000";

const Auth = {
    // Current User Types: 'patient', 'doctor', 'admin'
    
    // Save session
    setSession(type, data) {
        localStorage.setItem(`medilingo_${type}`, JSON.stringify(data));
    },

    // Get session
    getSession(type) {
        const item = localStorage.getItem(`medilingo_${type}`);
        try {
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    },

    // Clear session & logout
    logout(type, redirectUrl) {
        localStorage.removeItem(`medilingo_${type}`);
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    },

    // Guard page (e.g. check if logged in)
    requireAuth(type, redirectUrl) {
        const session = this.getSession(type);
        if (!session) {
            window.location.href = redirectUrl;
            return null;
        }
        return session;
    },

    // Display toast notification
    showToast(message, type = "success") {
        let toast = document.getElementById("toastNotification");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toastNotification";
            document.body.appendChild(toast);
        }

        const icon = type === "error" ? "❌" : (type === "warning" ? "⚠️" : "✅");
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        toast.style.display = "flex";
        
        if (type === "error") {
            toast.style.borderColor = "var(--emergency)";
        } else if (type === "warning") {
            toast.style.borderColor = "var(--warning)";
        } else {
            toast.style.borderColor = "var(--teal)";
        }

        setTimeout(() => {
            toast.style.display = "none";
        }, 4000);
    }
};
