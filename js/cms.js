/* =========================================================
   LLOYDS MUSAU PORTFOLIO
   Google Sheets CMS
   ========================================================= */

const CMS = {

    /*
     * Load portfolio data from Google Apps Script
     */
    async load() {

        const apiUrl = SITE_CONFIG.CMS_API;

        if (!apiUrl) {
            throw new Error("CMS API URL is not configured.");
        }

        try {

            const response = await fetch(apiUrl, {
                method: "GET",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `CMS request failed with HTTP ${response.status}`
                );
            }

            const data = await response.json();

            console.log("CMS data loaded successfully:", data);

            return this.normalise(data);

        } catch (error) {

            console.error("CMS loading error:", error);

            throw error;
        }
    },


    /*
     * Convert different possible Google Apps Script
     * response structures into one predictable object.
     */
    normalise(data) {

        /*
         * If the API returns:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * use data.data.
         */
        if (
            data &&
            typeof data === "object" &&
            data.data &&
            typeof data.data === "object"
        ) {
            data = data.data;
        }


        /*
         * If the API returns arrays directly,
         * wrap them in a predictable structure.
         */
        if (Array.isArray(data)) {

            return {
                profile: {},
                expertise: [],
                experience: [],
                projects: [],
                skills: [],
                certifications: [],
                education: []
            };
        }


        /*
         * Make sure every expected CMS collection exists.
         */
        return {

            profile:
                data.profile ||
                data.Profile ||
                data.about ||
                data.About ||
                {},

            expertise:
                data.expertise ||
                data.Expertise ||
                [],

            experience:
                data.experience ||
                data.Experience ||
                [],

            projects:
                data.projects ||
                data.Projects ||
                [],

            skills:
                data.skills ||
                data.Skills ||
                [],

            certifications:
                data.certifications ||
                data.Certifications ||
                [],

            education:
                data.education ||
                data.Education ||
                []
        };
    },


    /*
     * Safely retrieve a value from an object.
     *
     * This allows the CMS to work with slightly different
     * column naming conventions.
     */
    value(object, ...keys) {

        if (!object || typeof object !== "object") {
            return "";
        }

        for (const key of keys) {

            if (
                Object.prototype.hasOwnProperty.call(object, key) &&
                object[key] !== null &&
                object[key] !== undefined
            ) {

                return String(object[key]).trim();
            }
        }

        return "";
    },


    /*
     * Convert a comma-separated value into an array.
     *
     * Example:
     *
     * "Networking, IT Support, Systems Administration"
     *
     * becomes:
     *
     * ["Networking", "IT Support", "Systems Administration"]
     */
    list(value) {

        if (Array.isArray(value)) {
            return value;
        }

        if (!value) {
            return [];
        }

        return String(value)
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    },


    /*
     * Escape HTML before inserting CMS content
     * into the page.
     *
     * This is important because the website content
     * comes from an external data source.
     */
    escape(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },


    /*
     * Convert line breaks in Google Sheets
     * into HTML paragraphs/breaks.
     */
    text(value) {

        return this.escape(value)
            .replace(/\r\n/g, "<br>")
            .replace(/\n/g, "<br>");
    },


    /*
     * Determine whether a CMS record is active.
     *
     * If your sheet has an "Active" column,
     * values such as FALSE / NO / 0 will hide the record.
     *
     * If there is no Active column, the record remains visible.
     */
    isActive(item) {

        const active = this.value(
            item,
            "Active",
            "active",
            "Published",
            "published",
            "Status",
            "status"
        );

        if (!active) {
            return true;
        }

        return ![
            "false",
            "no",
            "0",
            "inactive",
            "draft",
            "hidden"
        ].includes(active.toLowerCase());
    },


    /*
     * Filter inactive records.
     */
    activeItems(items) {

        if (!Array.isArray(items)) {
            return [];
        }

        return items.filter(item => this.isActive(item));
    },


    /*
     * Sort records using common ordering columns.
     */
    sort(items) {

        if (!Array.isArray(items)) {
            return [];
        }

        return [...items].sort((a, b) => {

            const orderA = Number(
                this.value(a, "Order", "order", "Sort", "sort")
            );

            const orderB = Number(
                this.value(b, "Order", "order", "Sort", "sort")
            );

            if (!Number.isNaN(orderA) && !Number.isNaN(orderB)) {
                return orderA - orderB;
            }

            return 0;
        });
    }
};


/*
 * Make CMS globally accessible.
 *
 * app.js will use:
 *
 * CMS.load()
 * CMS.value()
 * CMS.escape()
 * CMS.text()
 */
window.CMS = CMS;
