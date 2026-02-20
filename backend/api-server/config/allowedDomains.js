/**
 * This file maps institution names to their approved email domains.
 * Add your organization's domain here to restrict registration.
 */
const allowedDomains = {
    "SRM University": ["srmist.edu.in", "srmuniv.ac.in"],
    "VIT University": ["vit.ac.in", "vitstudent.ac.in"],
    "IIT Madras": ["iitm.ac.in"],
    "Anna University": ["annauniv.edu"],
    "ACT College": ["act.edu.in"],
    "SafeVoice Org": ["safevoice.org"]
};

/**
 * Validates if an email belongs to the specified institution.
 * @param {string} email
 * @param {string} institution
 * @returns {boolean}
 */
const isEmailAllowed = (email, institution) => {
    if (!institution || !allowedDomains[institution]) return false;

    const emailDomain = email.split('@')[1];
    return allowedDomains[institution].includes(emailDomain);
};

module.exports = { allowedDomains, isEmailAllowed };
