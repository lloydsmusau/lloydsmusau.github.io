/* =========================================================
   LLOYDS MUSAU PORTFOLIO
   Main Application
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeSite();
});


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeSite() {

    try {

        console.log("Initializing Lloyds Musau portfolio...");

        /*
         * Set static configuration first.
         */
        setupCalendar();
        setupContactLinks();
        setupNavigation();

        /*
         * Load Google Sheets CMS.
         */
        const data = await CMS.load();

        console.log("Portfolio CMS:", data);

        /*
         * Render CMS-driven sections.
         */
        renderProfile(data.profile);

        renderExpertise(data.expertise);

        renderExperience(data.experience);

        renderProjects(data.projects);

        renderSkills(data.skills);

        renderCertifications(data.certifications);

        renderEducation(data.education);

        /*
         * Activate animations.
         */
        setupRevealAnimations();

        /*
         * Remove loading screen.
         */
        hideLoader();

        console.log("Portfolio initialized successfully.");

    } catch (error) {

        console.error("Portfolio initialization failed:", error);

        /*
         * IMPORTANT:
         * Do not leave the visitor staring at the LM loader
         * forever if Google Sheets fails.
         */
        showCMSFallback();

        setupRevealAnimations();

        hideLoader();
    }
}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile(profile) {

    if (!profile || typeof profile !== "object") {
        return;
    }

    const heroDescription =
        document.getElementById("hero-description");

    const aboutText =
        document.getElementById("about-text");


    /*
     * Hero description
     */
    const heroText = CMS.value(
        profile,
        "Hero Description",
        "hero_description",
        "HeroDescription",
        "Tagline",
        "tagline",
        "Professional Summary",
        "professional_summary"
    );

    if (heroDescription && heroText) {
        heroDescription.textContent = heroText;
    }


    /*
     * About section
     */
    const about = CMS.value(
        profile,
        "About",
        "about",
        "About Text",
        "about_text",
        "Bio",
        "bio",
        "Description",
        "description",
        "Professional Summary",
        "professional_summary"
    );

    if (aboutText && about) {
        aboutText.innerHTML = CMS.text(about);
    }


    /*
     * Update page title if supplied by CMS.
     */
    const title = CMS.value(
        profile,
        "Site Title",
        "site_title",
        "Title",
        "title"
    );

    if (title) {
        document.title = title;
    }
}


/* =========================================================
   EXPERTISE
   ========================================================= */

function renderExpertise(items) {

    const container =
        document.getElementById("expertise-grid");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Expertise information will be updated shortly.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activeItems.map((item, index) => {

            const title = CMS.value(
                item,
                "Title",
                "title",
                "Name",
                "name",
                "Area",
                "area",
                "Expertise",
                "expertise"
            );

            const description = CMS.value(
                item,
                "Description",
                "description",
                "Details",
                "details",
                "Summary",
                "summary"
            );

            const number =
                String(index + 1).padStart(2, "0");


            return `
                <article class="expertise-card reveal">

                    <div class="card-number">
                        ${CMS.escape(number)}
                    </div>

                    <h3>
                        ${CMS.escape(title)}
                    </h3>

                    <p>
                        ${CMS.text(description)}
                    </p>

                </article>
            `;

        }).join("");
}


/* =========================================================
   EXPERIENCE
   ========================================================= */

function renderExperience(items) {

    const container =
        document.getElementById("experience-list");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Professional experience will be updated shortly.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activeItems.map((item, index) => {

            const role = CMS.value(
                item,
                "Role",
                "role",
                "Position",
                "position",
                "Job Title",
                "job_title",
                "Title",
                "title"
            );

            const company = CMS.value(
                item,
                "Company",
                "company",
                "Organisation",
                "organisation",
                "Organization",
                "organization",
                "Employer",
                "employer"
            );

            const startDate = CMS.value(
                item,
                "Start Date",
                "start_date",
                "Start",
                "start",
                "From",
                "from"
            );

            const endDate = CMS.value(
                item,
                "End Date",
                "end_date",
                "End",
                "end",
                "To",
                "to"
            );

            const period = CMS.value(
                item,
                "Period",
                "period",
                "Duration",
                "duration"
            );

            const description = CMS.value(
                item,
                "Description",
                "description",
                "Responsibilities",
                "responsibilities",
                "Summary",
                "summary"
            );

            const location = CMS.value(
                item,
                "Location",
                "location"
            );


            let dateDisplay = period;

            if (!dateDisplay && (startDate || endDate)) {

                dateDisplay =
                    `${startDate}${startDate && endDate ? " — " : ""}${endDate}`;
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

                                <p class="experience-company">
                                    ${CMS.escape(company)}
                                </p>

                            </div>

                            <span class="experience-date">
                                ${CMS.escape(dateDisplay)}
                            </span>

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

                        <p class="experience-description">
                            ${CMS.text(description)}
                        </p>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   PROJECTS
   ========================================================= */

function renderProjects(items) {

    const container =
        document.getElementById("projects-grid");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Projects will be added shortly.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activeItems.map((item, index) => {

            const title = CMS.value(
                item,
                "Title",
                "title",
                "Project",
                "project",
                "Name",
                "name"
            );

            const description = CMS.value(
                item,
                "Description",
                "description",
                "Summary",
                "summary",
                "Details",
                "details"
            );

            const category = CMS.value(
                item,
                "Category",
                "category",
                "Type",
                "type"
            );

            const technologies = CMS.list(
                CMS.value(
                    item,
                    "Technologies",
                    "technologies",
                    "Tech Stack",
                    "tech_stack",
                    "Skills",
                    "skills",
                    "Tools",
                    "tools"
                )
            );

            const link = CMS.value(
                item,
                "Link",
                "link",
                "URL",
                "url",
                "Project URL",
                "project_url"
            );


            return `
                <article class="project-card reveal">

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

                        <p>
                            ${CMS.text(description)}
                        </p>

                        ${
                            technologies.length
                                ? `
                                    <div class="project-tags">

                                        ${technologies.map(tech => `
                                            <span>
                                                ${CMS.escape(tech)}
                                            </span>
                                        `).join("")}

                                    </div>
                                  `
                                : ""
                        }

                        ${
                            link
                                ? `
                                    <a
                                        href="${CMS.escape(link)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-link"
                                    >
                                        View project
                                        <span>↗</span>
                                    </a>
                                  `
                                : ""
                        }

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   SKILLS
   ========================================================= */

function renderSkills(items) {

    const container =
        document.getElementById("skills-grid");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Technical skills will be updated shortly.</p>
            </div>
        `;

        return;
    }


    /*
     * If your sheet has categories,
     * group skills by category.
     */

    const grouped = {};

    activeItems.forEach(item => {

        const category = CMS.value(
            item,
            "Category",
            "category",
            "Group",
            "group",
            "Area",
            "area"
        ) || "Technical Skills";

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push(item);
    });


    container.innerHTML =
        Object.entries(grouped).map(([category, categoryItems]) => {

            return `
                <div class="skills-group reveal">

                    <h3>
                        ${CMS.escape(category)}
                    </h3>

                    <div class="skills-list">

                        ${categoryItems.map(item => {

                            const skill = CMS.value(
                                item,
                                "Skill",
                                "skill",
                                "Name",
                                "name",
                                "Title",
                                "title"
                            );

                            return `
                                <span class="skill-item">
                                    ${CMS.escape(skill)}
                                </span>
                            `;

                        }).join("")}

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   CERTIFICATIONS
   ========================================================= */

function renderCertifications(items) {

    const container =
        document.getElementById("certifications-grid");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Certifications will be updated shortly.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activeItems.map(item => {

            const name = CMS.value(
                item,
                "Name",
                "name",
                "Certification",
                "certification",
                "Title",
                "title"
            );

            const issuer = CMS.value(
                item,
                "Issuer",
                "issuer",
                "Organisation",
                "organisation",
                "Organization",
                "organization",
                "Provider",
                "provider"
            );

            const date = CMS.value(
                item,
                "Date",
                "date",
                "Year",
                "year"
            );

            const credential = CMS.value(
                item,
                "Credential",
                "credential",
                "Credential ID",
                "credential_id",
                "Certificate URL",
                "certificate_url",
                "URL",
                "url"
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
                        issuer
                            ? `
                                <p>
                                    ${CMS.escape(issuer)}
                                </p>
                              `
                            : ""
                    }

                    ${
                        credential &&
                        credential.startsWith("http")
                            ? `
                                <a
                                    href="${CMS.escape(credential)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-link"
                                >
                                    View credential
                                    <span>↗</span>
                                </a>
                              `
                            : ""
                    }

                </article>
            `;

        }).join("");
}


/* =========================================================
   EDUCATION
   ========================================================= */

function renderEducation(items) {

    const container =
        document.getElementById("education-list");

    if (!container) {
        return;
    }

    const activeItems =
        CMS.sort(CMS.activeItems(items));

    if (!activeItems.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Education information will be updated shortly.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activeItems.map(item => {

            const institution = CMS.value(
                item,
                "Institution",
                "institution",
                "School",
                "school",
                "University",
                "university",
                "Organisation",
                "organisation"
            );

            const qualification = CMS.value(
                item,
                "Qualification",
                "qualification",
                "Degree",
                "degree",
                "Program",
                "program",
                "Course",
                "course",
                "Title",
                "title"
            );

            const period = CMS.value(
                item,
                "Period",
                "period",
                "Year",
                "year",
                "Date",
                "date"
            );

            const description = CMS.value(
                item,
                "Description",
                "description",
                "Details",
                "details"
            );


            return `
                <article class="education-item reveal">

                    <div class="education-period">
                        ${CMS.escape(period)}
                    </div>

                    <div class="education-content">

                        <h3>
                            ${CMS.escape(qualification)}
                        </h3>

                        <p class="education-institution">
                            ${CMS.escape(institution)}
                        </p>

                        ${
                            description
                                ? `
                                    <p>
                                        ${CMS.text(description)}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   GOOGLE CALENDAR
   ========================================================= */

function setupCalendar() {

    const calendarLink =
        document.getElementById("calendar-link");

    if (!calendarLink) {
        return;
    }

    if (
        typeof SITE_CONFIG !== "undefined" &&
        SITE_CONFIG.CALENDAR_BOOKING_URL
    ) {

        calendarLink.href =
            SITE_CONFIG.CALENDAR_BOOKING_URL;

        calendarLink.target = "_blank";

        calendarLink.rel =
            "noopener noreferrer";

    } else {

        calendarLink.href = "#";

    }
}


/* =========================================================
   CONTACT LINKS
   ========================================================= */

function setupContactLinks() {

    const emailLink =
        document.getElementById("email-link");

    const linkedinLink =
        document.getElementById("linkedin-link");

    const githubLink =
        document.getElementById("github-link");


    /*
     * These are deliberately kept here rather than
     * hard-coded throughout the HTML.
     */

    if (emailLink) {

        emailLink.href =
            "mailto:lloydsmusau02@gmail.com";

    }


    if (linkedinLink) {

        linkedinLink.href =
            "https://linkedin.com/in/lloydsmusau";

    }


    if (githubLink) {

        githubLink.href =
            "https://github.com/lloydsmusau";

    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const menuButton =
        document.getElementById("mobile-menu-button");

    const nav =
        document.getElementById("nav-links");

    if (!menuButton || !nav) {
        return;
    }


    menuButton.addEventListener("click", () => {

        nav.classList.toggle("active");

        menuButton.classList.toggle("active");

    });


    /*
     * Close mobile menu after clicking a link.
     */

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

            menuButton.classList.remove("active");

        });

    });
}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(".reveal");

    if (!elements.length) {
        return;
    }


    /*
     * If IntersectionObserver isn't available,
     * show everything immediately.
     */

    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {

            element.classList.add("visible");

        });

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(element => {

        observer.observe(element);

    });
}


/* =========================================================
   LOADER
   ========================================================= */

function hideLoader() {

    const loader =
        document.getElementById("page-loader");

    if (!loader) {
        return;
    }


    /*
     * Give the browser a short moment to paint
     * the rendered portfolio before removing loader.
     */

    setTimeout(() => {

        loader.classList.add("hidden");

        setTimeout(() => {

            loader.remove();

        }, 700);

    }, 250);
}


/* =========================================================
   CMS FALLBACK
   ========================================================= */

function showCMSFallback() {

    console.warn(
        "Google Sheets CMS could not be loaded. " +
        "Displaying the static portfolio content."
    );


    /*
     * We intentionally DON'T replace the entire page
     * with an error message.
     *
     * The static content already contained in index.html
     * should remain usable.
     */

    const containers = [

        "expertise-grid",
        "experience-list",
        "projects-grid",
        "skills-grid",
        "certifications-grid",
        "education-list"

    ];


    containers.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }


        /*
         * Only display a small message if the section
         * contains no content.
         */

        if (!element.innerHTML.trim()) {

            element.innerHTML = `
                <div class="empty-state">
                    <p>
                        Content is temporarily unavailable.
                        Please check back shortly.
                    </p>
                </div>
            `;

        }

    });
}


/* =========================================================
   GLOBAL ERROR HANDLING
   ========================================================= */

window.addEventListener("error", event => {

    console.error(
        "Website error:",
        event.error || event.message
    );

});


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );

    }
);
