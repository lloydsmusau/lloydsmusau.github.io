/* =========================================================
   LLOYDS MUSAU PORTFOLIO
   Google Sheets CMS
   Multi-section API loader
   ========================================================= */

const CMS = {

    /*
     * API endpoint
     */
    apiUrl: SITE_CONFIG.CMS_API,


    /* =====================================================
       LOAD COMPLETE CMS
       ===================================================== */

    async load() {

        if (!this.apiUrl) {
            throw new Error("CMS API URL is not configured.");
        }

        try {

            /*
             * The Apps Script API returns one section at a time.
             *
             * Therefore we request each CMS section separately.
             */

            const sections = [
                "profile",
                "expertise",
                "experience",
                "projects",
                "skills",
                "certifications",
                "education"
            ];


            const requests = sections.map(section =>
                this.fetchSection(section)
            );


            const results = await Promise.all(requests);


            const cms = {

                profile: results[0],
                expertise: results[1],
                experience: results[2],
                projects: results[3],
                skills: results[4],
                certifications: results[5],
                education: results[6]

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
                `CMS returned an error for section "${section}"`
            );

        }


        /*
         * Profile is returned as:
         *
         * [
         *   { key: "name", value: "Lloyds Musau" }
         * ]
         *
         * Convert it into:
         *
         * {
         *   name: "Lloyds Musau"
         * }
         */

        if (section === "profile") {

            return this.profileToObject(
                result.data
            );

        }


        /*
         * Other sections remain arrays.
         */

        if (Array.isArray(result.data)) {

            return result.data;

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


            profile[String(key).trim()] =
                String(value).trim();

        });


        return profile;

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
       COMMA-SEPARATED LIST
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

            .map(item =>
                item.trim()
            )

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
       ACTIVE RECORD CHECK
       ===================================================== */

    isActive(item) {

        const active =
            this.value(
                item,
                "Active",
                "active",
                "Published",
                "published",
                "Status",
                "status"
            );


        /*
         * If no status column exists,
         * assume the item is published.
         */

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
        ].includes(
            active.toLowerCase()
        );

    },


    /* =====================================================
       FILTER ACTIVE RECORDS
       ===================================================== */

    activeItems(items) {

        if (!Array.isArray(items)) {

            return [];

        }


        return items.filter(
            item =>
                this.isActive(item)
        );

    },


    /* =====================================================
       SORT RECORDS
       ===================================================== */

    sort(items) {

        if (!Array.isArray(items)) {

            return [];

        }


        return [...items].sort(
            (a, b) => {

                const orderA =
                    Number(
                        this.value(
                            a,
                            "Order",
                            "order",
                            "Sort",
                            "sort"
                        )
                    );


                const orderB =
                    Number(
                        this.value(
                            b,
                            "Order",
                            "order",
                            "Sort",
                            "sort"
                        )
                    );


                if (
                    !Number.isNaN(orderA) &&
                    !Number.isNaN(orderB)
                ) {

                    return orderA - orderB;

                }


                return 0;

            }
        );

    }

};


/*
 * Make CMS globally available.
 */

window.CMS = CMS;
