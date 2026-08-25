document.addEventListener(
    "DOMContentLoaded",
    initializeSite
);


async function initializeSite() {

    setupNavigation();

    setupCalendar();

    setupContactLinks();

    setupRevealAnimations();

    try {

        await Promise.all([
            loadProfile(),
            loadExperience(),
            loadProjects(),
            loadSkills(),
            loadCertifications(),
            loadEducation()
        ]);

    } catch (error) {

        console.error(
            "Portfolio CMS error:",
            error
        );

    }

    hideLoader();

}


/* =========================
   PROFILE
========================= */

async function loadProfile() {

    const data =
        await fetchCMS("profile");

    const profile = {};

    data.forEach(item => {

        profile[item.key] =
            item.value;

    });


    if (profile.hero_text) {

        const hero =
            document.getElementById(
                "hero-description"
            );

        if (hero) {
            hero.textContent =
                profile.hero_text;
        }

    }


    if (profile.about) {

        const about =
            document.getElementById(
                "about-text"
            );

        if (about) {
            about.textContent =
                profile.about;
        }

    }


    if (profile.email) {

        const email =
            document.getElementById(
                "email-link"
            );

        if (email) {

            email.href =
                `mailto:${profile.email}`;

        }

    }


    if (profile.linkedin) {

        const linkedin =
            document.getElementById(
                "linkedin-link"
            );

        if (linkedin) {

            linkedin.href =
                profile.linkedin;

        }

    }


    if (profile.github) {

        const github =
            document.getElementById(
                "github-link"
            );

        if (github) {

            github.href =
                profile.github;

        }

    }

}


/* =========================
   EXPERIENCE
========================= */

async function loadExperience() {

    const data =
        await fetchCMS("experience");

    const container =
        document.getElementById(
            "experience-list"
        );

    if (!container) return;


    data.sort(
        (a, b) =>
            Number(a.sort || 999) -
            Number(b.sort || 999)
    );


    container.innerHTML =
        data.map(item => `

            <article class="experience-item">

                <div class="experience-date">
                    ${escapeHTML(item.start || "")}
                    —
                    ${escapeHTML(item.end || "Present")}
                </div>

                <div class="experience-main">

                    <span class="experience-company">
                        ${escapeHTML(item.company || "")}
                    </span>

                    <h3>
                        ${escapeHTML(item.title || "")}
                    </h3>

                    <p>
                        ${escapeHTML(item.description || "")}
                    </p>

                </div>

                <div class="experience-location">
                    ${escapeHTML(item.location || "")}
                </div>

            </article>

        `).join("");

}


/* =========================
   PROJECTS
========================= */

async function loadProjects() {

    const data =
        await fetchCMS("projects");

    const container =
        document.getElementById(
            "projects-grid"
        );

    if (!container) return;


    const projects =
        data
            .filter(
                item =>
                    String(item.featured)
                        .toUpperCase() === "TRUE"
            )
            .sort(
                (a, b) =>
                    Number(a.sort || 999) -
                    Number(b.sort || 999)
            );


    container.innerHTML =
        projects.map(item => `

            <article class="project-card">

                <div class="project-card-top">

                    <span class="project-number">
                        ${escapeHTML(item.id || "")}
                    </span>

                    <span class="project-category">
                        ${escapeHTML(item.category || "")}
                    </span>

                </div>


                <div class="project-card-content">

                    <h3>
                        ${escapeHTML(item.title || "")}
                    </h3>

                    <p>
                        ${escapeHTML(item.description || "")}
                    </p>

                </div>


                <div class="project-card-footer">

                    <span>
                        ${escapeHTML(item.technologies || "")}
                    </span>

                    ${
                        item.live_url
                        ?
                        `<a
                            href="${escapeAttribute(item.live_url)}"
                            target="_blank"
                            rel="noopener"
                        >
                            View ↗
                        </a>`
                        :
                        ""
                    }

                </div>

            </article>

        `).join("");

}


/* =========================
   SKILLS
========================= */

async function loadSkills() {

    const data =
        await fetchCMS("skills");

    const container =
        document.getElementById(
            "skills-grid"
        );

    if (!container) return;


    const categories = {};


    data.forEach(item => {

        const category =
            item.category || "Other";

        if (!categories[category]) {

            categories[category] = [];

        }

        categories[category].push(
            item.skill
        );

    });


    container.innerHTML =
        Object.entries(categories)
            .map(
                ([category, skills]) => `

                    <div class="skill-category">

                        <h3>
                            ${escapeHTML(category)}
                        </h3>

                        <div class="skill-list">

                            ${skills
                                .map(
                                    skill =>
                                        `<span>
                                            ${escapeHTML(skill)}
                                        </span>`
                                )
                                .join("")
                            }

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================
   CERTIFICATIONS
========================= */

async function loadCertifications() {

    const data =
        await fetchCMS("certifications");

    const container =
        document.getElementById(
            "certifications-grid"
        );

    if (!container) return;


    container.innerHTML =
        data
            .sort(
                (a, b) =>
                    Number(a.sort || 999) -
                    Number(b.sort || 999)
            )
            .map(item => `

                <article class="certification-card">

                    <span class="certification-provider">
                        ${escapeHTML(item.provider || "")}
                    </span>

                    <h3>
                        ${escapeHTML(item.name || "")}
                    </h3>

                    <span class="certification-date">
                        ${escapeHTML(item.date || "")}
                    </span>

                    ${
                        item.credential_url
                        ?
                        `<a
                            href="${escapeAttribute(item.credential_url)}"
                            target="_blank"
                            rel="noopener"
                        >
                            Verify credential ↗
                        </a>`
                        :
                        ""
                    }

                </article>

            `)
            .join("");

}


/* =========================
   EDUCATION
========================= */

async function loadEducation() {

    const data =
        await fetchCMS("education");

    const container =
        document.getElementById(
            "education-list"
        );

    if (!container) return;


    container.innerHTML =
        data
            .sort(
                (a, b) =>
                    Number(a.sort || 999) -
                    Number(b.sort || 999)
            )
            .map(item => `

                <article class="education-item">

                    <span>
                        ${escapeHTML(item.start || "")}
                        —
                        ${escapeHTML(item.end || "")}
                    </span>

                    <div>

                        <h3>
                            ${escapeHTML(item.qualification || "")}
                        </h3>

                        <p>
                            ${escapeHTML(item.field || "")}
                        </p>

                        <strong>
                            ${escapeHTML(item.institution || "")}
                        </strong>

                    </div>

                </article>

            `)
            .join("");

}


/* =========================
   CALENDAR
========================= */

function setupCalendar() {

    const link =
        document.getElementById(
            "calendar-link"
        );

    if (!link) return;

    link.href =
        SITE_CONFIG.CALENDAR_BOOKING_URL;

}


/* =========================
   CONTACT
========================= */

function setupContactLinks() {

    /*
       Contact links are populated
       from the Profile CMS data.
    */

}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {

    const button =
        document.getElementById(
            "mobile-menu-button"
        );

    const navigation =
        document.getElementById(
            "nav-links"
        );

    if (!button || !navigation) return;


    button.addEventListener(
        "click",
        () => {

            navigation.classList.toggle(
                "active"
            );

            button.classList.toggle(
                "active"
            );

        }
    );


    navigation
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navigation.classList.remove(
                        "active"
                    );

                    button.classList.remove(
                        "active"
                    );

                }
            );

        });

}


/* =========================
   REVEAL ANIMATIONS
========================= */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

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

                });

            },
            {
                threshold: 0.15
            }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );

}


/* =========================
   LOADER
========================= */

function hideLoader() {

    const loader =
        document.getElementById(
            "page-loader"
        );

    if (!loader) return;


    setTimeout(
        () => {

            loader.classList.add(
                "hidden"
            );

        },
        400
    );

}


/* =========================
   SECURITY HELPERS
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return String(value ?? "")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

}
