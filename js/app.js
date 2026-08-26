/* =========================================================
   LLOYDS MUSAU PORTFOLIO
   Main Application
   Version: CMS-driven frontend
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeSite);


/* =========================================================
   GLOBAL APPLICATION STATE
   ========================================================= */

const SITE_STATE = {
    cms: null,
    initialized: false
};


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeSite() {

    try {

        console.log("Initializing Lloyds Musau portfolio...");

        /* Load CMS */
        const data = await CMS.load();

        SITE_STATE.cms = data;

        console.log("Portfolio CMS:", data);

        /* Site configuration */
        applySiteMetadata(data);
        applySettings(data.settings);

        /* Static UI */
        setupNavigation();
        setupCalendar(data.profile);
        setupContactLinks(data.profile);

        /* CMS content */
        renderProfile(data.profile);
        renderExpertise(data.skills);
        renderExperience(data.experience);
        renderProjects(data.projects);
        renderSkills(data.skills);
        renderCertifications(data.certifications);
        renderEducation(data.education);

        /* Interactive systems */
        setupRevealAnimations();
        setupSmoothScrolling();
        setupCurrentYear();
        setupBackToTop();

        SITE_STATE.initialized = true;

        console.log("Portfolio initialized successfully.");

        hideLoader();

    } catch (error) {

        console.error(
            "Portfolio initialization failed:",
            error
        );

        showCMSFallback();

        setupNavigation();
        setupSmoothScrolling();
        setupRevealAnimations();
        setupCurrentYear();
        setupBackToTop();

        hideLoader();
    }
}


/* =========================================================
   SITE METADATA
   ========================================================= */

function applySiteMetadata(data) {

    if (!data) {
        return;
    }

    const profile = data.profile || {};
    const settings = data.settings || {};

    const siteName =
        CMS.value(settings, "site_name") ||
        CMS.value(profile, "name") ||
        "Lloyds Musau";

    document.title =
        `${siteName} — IT Administrator & IT Operations Professional`;

    const description =
        CMS.value(
            profile,
            "hero_text",
            "hero_title",
            "about",
            "tagline"
        );

    if (description) {

        let meta =
            document.querySelector(
                'meta[name="description"]'
            );

        if (!meta) {

            meta = document.createElement("meta");

            meta.name = "description";

            document.head.appendChild(meta);
        }

        meta.content = description;
    }
}


/* =========================================================
   SETTINGS
   ========================================================= */

function applySettings(settings) {

    if (!settings) {
        return;
    }

    const visibilityMap = {

        show_experience: "experience-section",

        show_projects: "projects-section",

        show_certifications: "certifications-section",

        show_skills: "skills-section",

        show_education: "education-section"
    };

    Object.entries(visibilityMap).forEach(
        ([setting, sectionId]) => {

            const section =
                document.getElementById(sectionId);

            if (!section) {
                return;
            }

            const visible =
                CMS.boolean(
                    settings[setting],
                    true
                );

            section.hidden = !visible;
        }
    );
}


/* =========================================================
   PROFILE / HERO
   ========================================================= */

function renderProfile(profile) {

    if (
        !profile ||
        typeof profile !== "object"
    ) {
        return;
    }

    /* Name */
    setText(
        "profile-name",
        CMS.value(profile, "name")
    );

    setText(
        "hero-name",
        CMS.value(profile, "name")
    );

    /* Professional title */
    const title =
        CMS.value(profile, "title");

    setText(
        "profile-title",
        title
    );

    setText(
        "hero-title",
        CMS.value(profile, "hero_title") || title
    );

    /* Tagline */
    setText(
        "hero-tagline",
        CMS.value(profile, "tagline")
    );

    /* Location */
    setText(
        "profile-location",
        CMS.value(profile, "location")
    );

    /* Hero description */
    const heroText =
        CMS.value(
            profile,
            "hero_text",
            "hero_description",
            "tagline"
        );

    const heroDescription =
        document.getElementById(
            "hero-description"
        );

    if (
        heroDescription &&
        heroText
    ) {

        heroDescription.innerHTML =
            CMS.text(heroText);
    }

    /* About */
    const about =
        CMS.value(
            profile,
            "about"
        );

    const aboutText =
        document.getElementById(
            "about-text"
        );

    if (
        aboutText &&
        about
    ) {

        aboutText.innerHTML =
            CMS.text(about);
    }

    /* Profile image */
    const image =
        CMS.value(
            profile,
            "profile_image",
            "image",
            "photo"
        );

    if (image) {

        document
            .querySelectorAll(
                "[data-profile-image]"
            )
            .forEach(element => {

                element.src = image;

                element.alt =
                    CMS.value(
                        profile,
                        "name"
                    ) ||
                    "Lloyds Musau";
            });
    }
}


/* =========================================================
   EXPERTISE
   Derived from Skills.category
   ========================================================= */

function renderExpertise(items) {

    const container =
        document.getElementById(
            "expertise-grid"
        );

    if (!container) {
        return;
    }

    if (!Array.isArray(items)) {

        container.innerHTML = "";

        return;
    }

    const featured =
        items.filter(
            item => CMS.isFeatured(item)
        );

    const source =
        featured.length
            ? featured
            : items;

    const grouped =
        CMS.groupBy(
            CMS.sort(source),
            "category"
        );

    const categories =
        Object.entries(grouped);

    if (!categories.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Specialist areas will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        categories.map(
            ([category, skills], index) => {

                const number =
                    String(index + 1)
                        .padStart(2, "0");

                return `
                    <article class="expertise-card reveal">

                        <span class="card-number">
                            ${number}
                        </span>

                        <h3>
                            ${CMS.escape(category)}
                        </h3>

                        <div class="expertise-skills">

                            ${skills
                                .map(skill => `
                                    <span>
                                        ${CMS.escape(
                                            CMS.value(
                                                skill,
                                                "skill"
                                            )
                                        )}
                                    </span>
                                `)
                                .join("")}

                        </div>

                    </article>
                `;
            }
        ).join("");
}


/* =========================================================
   EXPERIENCE
   ========================================================= */

function renderExperience(items) {

    const container =
        document.getElementById(
            "experience-list"
        );

    if (!container) {
        console.warn(
            "Experience container #experience-list was not found."
        );
        return;
    }

    console.log(
        "Rendering experience:",
        items
    );

    if (!Array.isArray(items)) {

        console.warn(
            "Experience data is not an array:",
            items
        );

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Professional experience will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    /*
     * Remove completely empty rows.
     */

    const activeItems =
        CMS.sort(
            items.filter(item => {

                if (!item || typeof item !== "object") {
                    return false;
                }

                return (
                    CMS.value(item, "title") ||
                    CMS.value(item, "company") ||
                    CMS.value(item, "description")
                );
            })
        );

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Professional experience will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activeItems.map(
            (item, index) => {

                const role =
                    CMS.value(
                        item,
                        "title"
                    ) || "IT Professional";

                const company =
                    CMS.value(
                        item,
                        "company"
                    );

                const location =
                    CMS.value(
                        item,
                        "location"
                    );

                const start =
                    CMS.value(
                        item,
                        "start"
                    );

                const end =
                    CMS.value(
                        item,
                        "end"
                    );

                const current =
                    CMS.boolean(
                        CMS.value(
                            item,
                            "current"
                        ),
                        false
                    );

                const description =
                    CMS.value(
                        item,
                        "description"
                    );

                /*
                 * Date display
                 */

                let dateDisplay = "";

                if (current) {

                    dateDisplay =
                        start
                            ? `${start} — Present`
                            : "Present";

                } else if (start && end) {

                    dateDisplay =
                        `${start} — ${end}`;

                } else if (start) {

                    dateDisplay =
                        start;

                } else if (end) {

                    dateDisplay =
                        end;
                }

                return `
                    <article class="experience-item reveal">

                        <div class="experience-index">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="experience-main">

                            <div class="experience-header">

                                <div>

                                    <h3>
                                        ${CMS.escape(role)}
                                    </h3>

                                    ${
                                        company
                                            ? `
                                                <p class="experience-company">
                                                    ${CMS.escape(company)}
                                                </p>
                                              `
                                            : ""
                                    }

                                </div>

                                ${
                                    dateDisplay
                                        ? `
                                            <span class="experience-date">
                                                ${CMS.escape(dateDisplay)}
                                            </span>
                                          `
                                        : ""
                                }

                            </div>

                            ${
                                location
                                    ? `
                                        <div class="experience-location">
                                            ${CMS.escape(location)}
                                        </div>
                                      `
                                    : ""
                            }

                            ${
                                description
                                    ? `
                                        <p class="experience-description">
                                            ${CMS.text(description)}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                    </article>
                `;
            }
        ).join("");

    console.log(
        `Experience rendered successfully: ${activeItems.length} item(s).`
    );
}


/* =========================================================
   PROJECTS
   ========================================================= */

function renderProjects(items) {

    const container =
        document.getElementById(
            "projects-grid"
        );

    if (!container) {
        return;
    }

    const activeItems =
        Array.isArray(items)
            ? CMS.sort(items)
            : [];

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Projects will be added shortly.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activeItems.map(
            (item, index) => {

                const title =
                    CMS.value(
                        item,
                        "title"
                    );

                const category =
                    CMS.value(
                        item,
                        "category"
                    );

                const description =
                    CMS.value(
                        item,
                        "description"
                    );

                const technologies =
                    CMS.list(
                        CMS.value(
                            item,
                            "technologies"
                        )
                    );

                const featured =
                    CMS.isFeatured(item);

                return `
                    <article
                        class="
                            project-card
                            ${featured ? "project-featured" : ""}
                            reveal
                        "
                    >

                        <div class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="project-content">

                            ${
                                category
                                    ? `
                                        <span class="project-category">
                                            ${CMS.escape(category)}
                                        </span>
                                      `
                                    : ""
                            }

                            <h3>
                                ${CMS.escape(title)}
                            </h3>

                            ${
                                description
                                    ? `
                                        <p>
                                            ${CMS.text(description)}
                                        </p>
                                      `
                                    : ""
                            }

                            ${
                                technologies.length
                                    ? `
                                        <div class="project-tags">

                                            ${technologies
                                                .map(
                                                    tech => `
                                                        <span>
                                                            ${CMS.escape(tech)}
                                                        </span>
                                                    `
                                                )
                                                .join("")}

                                        </div>
                                      `
                                    : ""
                            }

                        </div>

                    </article>
                `;
            }
        ).join("");
}


/* =========================================================
   SKILLS
   ========================================================= */

function renderSkills(items) {

    const container =
        document.getElementById(
            "skills-grid"
        );

    if (!container) {
        return;
    }

    const activeItems =
        Array.isArray(items)
            ? CMS.sort(items)
            : [];

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Technical capabilities will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    const grouped =
        CMS.groupBy(
            activeItems,
            "category"
        );

    container.innerHTML =
        Object.entries(grouped)
            .map(
                ([category, categoryItems]) => `

                    <div class="skills-group reveal">

                        <h3>
                            ${CMS.escape(category)}
                        </h3>

                        <div class="skills-list">

                            ${categoryItems
                                .map(
                                    item => `
                                        <span class="skill-item">
                                            ${CMS.escape(
                                                CMS.value(
                                                    item,
                                                    "skill"
                                                )
                                            )}
                                        </span>
                                    `
                                )
                                .join("")}

                        </div>

                    </div>
                `
            )
            .join("");
}


/* =========================================================
   CERTIFICATIONS
   ========================================================= */

function renderCertifications(items) {

    const container =
        document.getElementById(
            "certifications-grid"
        );

    if (!container) {
        return;
    }

    const activeItems =
        Array.isArray(items)
            ? CMS.sort(items)
            : [];

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Certifications will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activeItems.map(
            item => {

                const name =
                    CMS.value(
                        item,
                        "name"
                    );

                const provider =
                    CMS.value(
                        item,
                        "provider"
                    );

                const date =
                    CMS.value(
                        item,
                        "date"
                    );

                return `
                    <article class="certification-card reveal">

                        <div class="certification-top">

                            <span class="certification-mark">
                                ✓
                            </span>

                            ${
                                date
                                    ? `
                                        <span class="certification-date">
                                            ${CMS.escape(date)}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                        <h3>
                            ${CMS.escape(name)}
                        </h3>

                        ${
                            provider
                                ? `
                                    <p>
                                        ${CMS.escape(provider)}
                                    </p>
                                  `
                                : ""
                        }

                    </article>
                `;
            }
        ).join("");
}


/* =========================================================
   EDUCATION
   ========================================================= */

function renderEducation(items) {

    const container =
        document.getElementById(
            "education-list"
        );

    if (!container) {
        console.warn(
            "Education container #education-list was not found."
        );
        return;
    }

    console.log(
        "Rendering education:",
        items
    );

    if (!Array.isArray(items)) {

        console.warn(
            "Education data is not an array:",
            items
        );

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Education information will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    /*
     * Remove completely empty rows.
     */

    const activeItems =
        CMS.sort(
            items.filter(item => {

                if (!item || typeof item !== "object") {
                    return false;
                }

                return (
                    CMS.value(item, "institution") ||
                    CMS.value(item, "qualification") ||
                    CMS.value(item, "field")
                );
            })
        );

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    Education information will be updated shortly.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        activeItems.map(
            (item, index) => {

                const institution =
                    CMS.value(
                        item,
                        "institution"
                    ) || "Institution";

                const qualification =
                    CMS.value(
                        item,
                        "qualification"
                    ) || "Qualification";

                const field =
                    CMS.value(
                        item,
                        "field"
                    );

                const start =
                    CMS.value(
                        item,
                        "start"
                    );

                const end =
                    CMS.value(
                        item,
                        "end"
                    );

                /*
                 * Education period
                 */

                let period = "";

                if (start && end) {

                    period =
                        `${start} — ${end}`;

                } else if (start) {

                    period =
                        start;

                } else if (end) {

                    period =
                        end;
                }

                return `
                    <article class="education-item reveal">

                        ${
                            period
                                ? `
                                    <div class="education-period">
                                        ${CMS.escape(period)}
                                    </div>
                                  `
                                : ""
                        }

                        <div class="education-content">

                            <h3>
                                ${CMS.escape(qualification)}
                            </h3>

                            ${
                                field
                                    ? `
                                        <p class="education-field">
                                            ${CMS.escape(field)}
                                        </p>
                                      `
                                    : ""
                            }

                            <p class="education-institution">
                                ${CMS.escape(institution)}
                            </p>

                        </div>

                    </article>
                `;
            }
        ).join("");

    console.log(
        `Education rendered successfully: ${activeItems.length} item(s).`
    );
}


/* =========================================================
   CONTACT LINKS
   ========================================================= */

function setupContactLinks(profile) {

    if (!profile) {
        return;
    }

    const email =
        CMS.value(
            profile,
            "email"
        );

    const linkedin =
        CMS.value(
            profile,
            "linkedin"
        );

    const github =
        CMS.value(
            profile,
            "github"
        );

    const emailLink =
        document.getElementById(
            "email-link"
        );

    const linkedinLink =
        document.getElementById(
            "linkedin-link"
        );

    const githubLink =
        document.getElementById(
            "github-link"
        );

    if (
        emailLink &&
        email
    ) {

        emailLink.href =
            `mailto:${email}`;
    }

    if (
        linkedinLink &&
        linkedin
    ) {

        linkedinLink.href =
            linkedin;

        linkedinLink.target =
            "_blank";

        linkedinLink.rel =
            "noopener noreferrer";
    }

    if (
        githubLink &&
        github
    ) {

        githubLink.href =
            github;

        githubLink.target =
            "_blank";

        githubLink.rel =
            "noopener noreferrer";
    }
}


/* =========================================================
   GOOGLE CALENDAR
   ========================================================= */

function setupCalendar(profile) {

    const calendarLink =
        document.getElementById(
            "calendar-link"
        );

    if (!calendarLink) {
        return;
    }

    const calendarUrl =
        (
            typeof SITE_CONFIG !== "undefined" &&
            SITE_CONFIG.CALENDAR_BOOKING_URL
        )
            ? SITE_CONFIG.CALENDAR_BOOKING_URL
            : "";

    if (calendarUrl) {

        calendarLink.href =
            calendarUrl;

        calendarLink.target =
            "_blank";

        calendarLink.rel =
            "noopener noreferrer";

    } else {

        calendarLink.href = "#";

        calendarLink.addEventListener(
            "click",
            event => {

                event.preventDefault();

                console.info(
                    "Google Calendar booking is not configured yet."
                );
            }
        );
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const menuButton =
        document.getElementById(
            "mobile-menu-button"
        );

    const nav =
        document.getElementById(
            "nav-links"
        );

    if (
        !menuButton ||
        !nav
    ) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {

            const active =
                nav.classList.toggle(
                    "active"
                );

            menuButton.classList.toggle(
                "active"
            );

            menuButton.setAttribute(
                "aria-expanded",
                active ? "true" : "false"
            );
        }
    );

    nav.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "active"
                    );

                    menuButton.classList.remove(
                        "active"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}


/* =========================================================
   SMOOTH SCROLLING
   ========================================================= */

function setupSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link
                            .getAttribute("href")
                            ?.substring(1);

                    if (!targetId) {
                        return;
                    }

                    const target =
                        document.getElementById(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        });
}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );

    if (!elements.length) {
        return;
    }

    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );
            }
        );

        return;
    }

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

    elements.forEach(
        element => {

            observer.observe(
                element
            );
        }
    );
}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function setupCurrentYear() {

    const year =
        new Date().getFullYear();

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(
            element => {

                element.textContent =
                    year;
            }
        );
}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function setupBackToTop() {

    const button =
        document.getElementById(
            "back-to-top"
        );

    if (!button) {
        return;
    }

    const updateVisibility =
        () => {

            if (
                window.scrollY > 600
            ) {

                button.classList.add(
                    "visible"
                );

            } else {

                button.classList.remove(
                    "visible"
                );
            }
        };

    window.addEventListener(
        "scroll",
        updateVisibility,
        {
            passive: true
        }
    );

    button.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );

    updateVisibility();
}


/* =========================================================
   DOM HELPERS
   ========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (
        !element ||
        value === undefined ||
        value === null
    ) {
        return;
    }

    element.textContent =
        value;
}


/* =========================================================
   LOADER
   ========================================================= */

function hideLoader() {

    const loader =
        document.getElementById(
            "page-loader"
        );

    if (!loader) {
        return;
    }

    setTimeout(
        () => {

            loader.classList.add(
                "hidden"
            );

            setTimeout(
                () => {

                    loader.remove();

                },
                700
            );

        },
        250
    );
}


/* =========================================================
   CMS FALLBACK
   ========================================================= */

function showCMSFallback() {

    console.warn(
        "CMS rendering failed. Static page content will remain visible."
    );

    const containers = [

        "expertise-grid",
        "experience-list",
        "projects-grid",
        "skills-grid",
        "certifications-grid",
        "education-list"

    ];

    containers.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (!element) {
                return;
            }

            if (
                !element.innerHTML.trim()
            ) {

                element.innerHTML = `
                    <div class="empty-state">
                        <p>
                            Content is temporarily unavailable.
                        </p>
                    </div>
                `;
            }
        }
    );
}


/* =========================================================
   GLOBAL ERROR HANDLING
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Website error:",
            event.error ||
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );
    }
);


/* =========================================================
   LOADER FAILSAFE
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                const loader =
                    document.getElementById(
                        "page-loader"
                    );

                if (loader) {

                    loader.classList.add(
                        "hidden"
                    );
                }

            },
            1500
        );
    }
);
