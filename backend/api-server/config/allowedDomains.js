
const allowedDomains = {
    "SRM University": ["srmist.edu.in", "srmuniv.ac.in"],
    "VIT University": ["vit.ac.in", "vitstudent.ac.in"],
    "IIT Madras": ["iitm.ac.in"],
    "Agni College": ["act.edu.in"],
    "Anna University": ["annauniv.edu"],
    "SafeVoice Org": ["safevoice.org"]
};



const isEmailAllowed = (email, institution) => {
    const trimmedInst = institution ? institution.trim() : "";
    console.log(`Checking email: ${email} for institution: "${trimmedInst}"`);
    if (!trimmedInst || !allowedDomains[trimmedInst]) {
        console.log(`Institution "${trimmedInst}" not found in registry. Keys: ${Object.keys(allowedDomains)}`);
        return false;
    }

    const emailDomain = email.split('@')[1].toLowerCase();
    const allowed = allowedDomains[trimmedInst].map(d => d.toLowerCase()).includes(emailDomain);
    console.log(`Email domain: ${emailDomain}, Allowed: ${allowed}`);
    return allowed;
};

module.exports = { allowedDomains, isEmailAllowed };
