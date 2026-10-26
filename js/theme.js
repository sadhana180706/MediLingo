/* ========================================================
   MEDI LINGO - THEME & RESPONSIVE UI CONTROLLER
   ======================================================== */

(function () {
    // 1. Instant execution to prevent Theme Flash (FOUC)
    try {
        const savedTheme = localStorage.getItem("theme") || localStorage.getItem("medilingo_theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
    } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

// Global Theme Toggle Function
window.toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
        localStorage.setItem("theme", nextTheme);
        localStorage.setItem("medilingo_theme", nextTheme);
    } catch (e) {
        console.warn("LocalStorage access error:", e);
    }
    
    updateThemeToggleUI(nextTheme);
};

// Global Theme Setter Function
window.setTheme = function (theme) {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("theme", theme);
        localStorage.setItem("medilingo_theme", theme);
    } catch (e) {}
    updateThemeToggleUI(theme);
};

// Sync all theme toggle buttons across the page
window.updateThemeToggleUI = function (theme) {
    const current = theme || document.documentElement.getAttribute("data-theme") || "dark";
    const isDark = current === "dark";

    const buttons = document.querySelectorAll(".theme-toggle-btn");
    buttons.forEach((btn) => {
        btn.setAttribute("data-current-theme", current);
        btn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
        btn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");

        const iconEl = btn.querySelector(".theme-toggle-icon");
        const textEl = btn.querySelector(".theme-toggle-text");

        if (iconEl) {
            iconEl.textContent = isDark ? "🌙" : "☀️";
        }
        if (textEl) {
            textEl.textContent = isDark ? "Dark" : "Light";
        }
    });
};

// Mobile Sidebar Drawer Controller
window.toggleSidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle("mobile-open");
    if (backdrop) {
        backdrop.classList.toggle("active", isOpen);
    }
};

window.closeSidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (backdrop) backdrop.classList.remove("active");
};

// Document ready listener
document.addEventListener("DOMContentLoaded", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    updateThemeToggleUI(currentTheme);

    // Auto-create sidebar backdrop if page has a sidebar
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !document.querySelector(".sidebar-backdrop")) {
        const backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        backdrop.addEventListener("click", window.closeSidebar);
        document.body.appendChild(backdrop);
    }

    // Close mobile sidebar when clicking a nav item on small screens
    document.querySelectorAll(".sidebar .nav-item").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                window.closeSidebar();
            }
        });
    });

    // Initialize interactive search bar behaviors
    initSearchBoxBehaviors();
});

// Interactive Search Box Focus/Blur Controller
function initSearchBoxBehaviors() {
    function setupInput(input) {
        const parentBox = input.closest(".search-box");
        const icon = parentBox ? (parentBox.querySelector(".search-icon") || parentBox.querySelector(".icon")) : null;

        function updateState() {
            const isFocused = document.activeElement === input;
            const hasValue = input.value && input.value.trim().length > 0;

            if (parentBox) {
                parentBox.classList.toggle("is-focused", isFocused);
                parentBox.classList.toggle("has-value", hasValue);
            }

            if (icon) {
                if (isFocused || hasValue) {
                    icon.style.opacity = "0";
                    icon.style.visibility = "hidden";
                    icon.style.pointerEvents = "none";
                } else {
                    icon.style.opacity = "1";
                    icon.style.visibility = "visible";
                    icon.style.pointerEvents = "none";
                }
            }
        }

        input.addEventListener("focus", updateState);
        input.addEventListener("blur", updateState);
        input.addEventListener("input", updateState);
        input.addEventListener("keyup", updateState);
        input.addEventListener("change", updateState);
        input.addEventListener("paste", () => setTimeout(updateState, 10));

        // Initial sync
        updateState();
    }

    document.querySelectorAll(".search-box input").forEach(setupInput);
}


