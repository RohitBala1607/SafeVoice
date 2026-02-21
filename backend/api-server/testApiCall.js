const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testHttp() {
    try {
        const token = jwt.sign({ role: 'authority', institutionId: 'ORG-610982' }, process.env.JWT_SECRET);

        console.log("Making fetch to IIT Madras...");
        const res1 = await fetch("http://localhost:5000/api/authorities/institution/IIT%20Madras/records", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data1 = await res1.json().catch(() => null);
        console.log("IIT Madras Response:", res1.status, data1);

        console.log("Making fetch to VIT University...");
        const res2 = await fetch("http://localhost:5000/api/authorities/institution/VIT%20University/records", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data2 = await res2.json().catch(() => null);
        console.log("VIT University Response:", res2.status, data2);

    } catch (err) {
        console.error("Fetch threw:", err);
    }
}
testHttp();
