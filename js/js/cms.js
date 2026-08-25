async function fetchCMS(section) {

    if (!SITE_CONFIG.CMS_API) {
        throw new Error("CMS API URL is not configured.");
    }

    const url =
        `${SITE_CONFIG.CMS_API}?section=${encodeURIComponent(section)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `CMS request failed: ${response.status}`
        );
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(
            result.error || "CMS returned an error."
        );
    }

    return result.data;

}
