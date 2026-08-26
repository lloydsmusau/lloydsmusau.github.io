/* =========================================================
   LLOYDS MUSAU PORTFOLIO
   Google Sheets CMS
   ========================================================= */

const CMS = {

    apiUrl: SITE_CONFIG.CMS_API,


    /* =====================================================
       LOAD COMPLETE CMS
       ===================================================== */

    async load() {

        if (!this.apiUrl) {
            throw new Error("CMS API URL is not configured.");
        }

        try {

            const sections = [
                "profile",
                "experience",
                "projects",
                "skills",
                "certifications",
                "education",
                "settings"
            ];


            const requests = sections.map(section =>
                this.fetchSection(section)
            );


            const results = await Promise.all(requests);


            const cms = {

                profile: results[0],
                experience: results[1],
                projects: results[2],
                skills: results[3],
                certifications: results[4],
                education: results[5],
                settings: results[6]

            };


            console.log(
                "CMS data loaded successfully:",
                cms
            );


            return cms;

        } catch (error) {

            console.error(
                "CMS loading error:",
                error
            );

            throw error;

        }

    },


    /* =====================================================
       FETCH ONE SECTION
       ===================================================== */

    async fetchSection(section) {

        const url =
            `${this.apiUrl}?section=${encodeURIComponent(section)}`;


        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                `CMS request failed for "${section}" with HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                `CMS returned an error for section "${section}": ${
                    result.error || "Unknown error"
                }`
            );

        }


        /*
         * Profile uses:
         *
         * key | value
         *
         * Convert it into:
         *
         * {
         *   name: "Lloyds Musau",
         *   title: "IT Administrator"
         * }
         */

        if (section === "profile") {

            return this.profileToObject(
                result.data
            );

        }


        /*
         * Settings currently contains
         * site configuration values.
         */

        if (section === "settings") {

            return this.settingsToObject(
                result.data
            );

        }


        /*
         * All other sections are arrays.
         */

        if (Array.isArray(result.data)) {

            return this.sort(
                result.data
            );

        }


        return [];

    },


    /* =====================================================
       PROFILE ARRAY → OBJECT
       ===================================================== */

    profileToObject(rows) {

        const profile = {};


        if (!Array.isArray(rows)) {

            return profile;

        }


        rows.forEach(row => {

            if (!row || typeof row !== "object") {
                return;
            }


            const key =
                row.key ??
                row.Key;


            const value =
                row.value ??
                row.Value ??
                "";


            if (!key) {
                return;
            }


            profile[
                String(key).trim()
            ] =
                String(value).trim();

        });


        return profile;

    },


    /* =====================================================
       SETTINGS ARRAY → OBJECT
       ===================================================== */

    settingsToObject(rows) {

        const settings = {};


        if (!Array.isArray(rows)) {

            return settings;

        }


        rows.forEach(row => {

            if (!row || typeof row !== "object") {
                return;
            }


            Object.entries(row).forEach(
                ([key, value]) => {

                    if (
                        key &&
                        value !== undefined &&
                        value !== null
                    ) {

                        settings[
                            String(key).trim()
                        ] =
                            String(value).trim();

                    }

                }
            );

        });


        return settings;

    },


    /* =====================================================
       VALUE HELPER
       ===================================================== */

    value(object, ...keys) {

        if (
            !object ||
            typeof object !== "object"
        ) {

            return "";

        }


        for (const key of keys) {

            if (
                Object.prototype.hasOwnProperty.call(
                    object,
                    key
                ) &&
                object[key] !== null &&
                object[key] !== undefined
            ) {

                return String(
                    object[key]
                ).trim();

            }

        }


        return "";

    },


    /* =====================================================
       BOOLEAN HELPER
       ===================================================== */

    boolean(value, defaultValue = false) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return defaultValue;

        }


        return [
            "true",
            "1",
            "yes",
            "y",
            "on"
        ].includes(
            String(value)
                .trim()
                .toLowerCase()
        );

    },


    /* =====================================================
       LIST HELPER
       ===================================================== */

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


    /* =====================================================
       HTML ESCAPING
       ===================================================== */

    escape(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    },


    /* =====================================================
       TEXT → SAFE HTML
       ===================================================== */

    text(value) {

        return this.escape(value)

            .replace(
                /\r\n/g,
                "<br>"
            )

            .replace(
                /\n/g,
                "<br>"
            );

    },


    /* =====================================================
       ACTIVE / FEATURED CHECK
       ===================================================== */

    isFeatured(item) {

        return this.boolean(
            this.value(
                item,
                "featured",
                "Featured"
            ),
            false
        );

    },


    /* =====================================================
       SORT
       ===================================================== */

    sort(items) {

        if (!Array.isArray(items)) {

            return [];

        }


        return [...items].sort(
            (a, b) => {

                const orderA =
                    parseInt(
                        this.value(
                            a,
                            "sort",
                            "Sort",
                            "order",
                            "Order"
                        ),
                        10
                    );


                const orderB =
                    parseInt(
                        this.value(
                            b,
                            "sort",
                            "Sort",
                            "order",
                            "Order"
                        ),
                        10
                    );


                const safeA =
                    Number.isNaN(orderA)
                        ? 9999
                        : orderA;


                const safeB =
                    Number.isNaN(orderB)
                        ? 9999
                        : orderB;


                return safeA - safeB;

            }
        );

    },


    /* =====================================================
       GROUP BY CATEGORY
       ===================================================== */

    groupBy(items, field) {

        if (!Array.isArray(items)) {

            return {};

        }


        return items.reduce(
            (groups, item) => {

                const category =
                    this.value(
                        item,
                        field
                    ) || "Other";


                if (!groups[category]) {

                    groups[category] = [];

                }


                groups[category].push(item);


                return groups;

            },
            {}
        );

    }

};


/*
 * Make CMS globally available.
 */

window.CMS = CMS;
