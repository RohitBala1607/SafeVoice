
const allowedDomains = {
    "SRM University": ["srmist.edu.in", "srmuniv.ac.in"],
    "VIT University": ["vit.ac.in", "vitstudent.ac.in"],
    "IIT Madras": ["iitm.ac.in"],
    "Agni College Of Technology": ["act.edu.in"],
    "Anna University": ["annauniv.edu"],
    "SafeVoice Org": ["safevoice.org"]
};



const isEmailAllowed = (email, institution) => {
    if (!institution || !allowedDomains[institution]) return false;

    const emailDomain = email.split('@')[1];
    return allowedDomains[institution].includes(emailDomain);
};

module.exports = { allowedDomains, isEmailAllowed };
