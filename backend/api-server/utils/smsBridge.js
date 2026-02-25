const axios = require('axios');

/**
 * Trigger an SMS alert via an SMS Gateway.
 * Currently configured for Fast2SMS (India) as it's the easiest to setup, 
 * but can be easily adapted for Twilio or others.
 * 
 * @param {string} phone - Target phone number.
 * @param {string} message - Message to send.
 */
exports.sendSMSAlert = async (phone, message) => {
    try {
        const apiKey = process.env.SMS_API_KEY;

        // 🧪 MOCK MODE: If no API key is provided, log to console
        if (!apiKey || apiKey === 'your_api_key_here') {
            console.log('\n--- 🧪 SMS MOCK ALERT ---');
            console.log(`To: ${phone}`);
            console.log(`Message: ${message}`);
            console.log('-------------------------\n');
            return true;
        }

        console.log(`📡 Sending SMS to ${phone}...`);

        // Fast2SMS Implementation
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q',
            message: message,
            language: 'unicode', // Required for emojis like 🚨, 📍
            flash: 0,
            numbers: phone.replace(/\D/g, '').slice(-10), // Ensures 10 digit number
        }, {
            headers: {
                "authorization": apiKey
            }
        });

        if (response.data.return) {
            console.log(`✅ SMS sent successfully to ${phone}`);
            return true;
        } else {
            console.error(`❌ SMS Gateway Error: ${JSON.stringify(response.data)}`);
            return false;
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        console.error(`❌ SMS Bridge Failed for ${phone}:`, errorMessage);
        return false;
    }
};
