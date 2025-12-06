function removeAccents(str = "") {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(text = "") {
    if (!text) return "";

    text = removeAccents(text);
    text = text.toLowerCase();
    text = text.replace(/[^a-z0-9ñ\s]/g, "");
    text = text.replace(/\s+/g, " ").trim();

    return text;
}

module.exports = { normalizeText };