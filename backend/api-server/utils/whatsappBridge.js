const { spawn } = require('child_process');
const path = require('path');

/**
 * Trigger the Python WhatsApp automation service.
 * @param {string} phone - Target phone number.
 * @param {string} message - Message to send.
 */
exports.sendWhatsAppAlert = (phone, message) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '..', 'services', 'whatsapp_service.py');

        console.log(`🚀 Spawning Python WhatsApp service for ${phone}...`);

        const pythonProcess = spawn('python', [pythonScript, phone, message]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Python Stdout]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python Stderr]: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Python WhatsApp service completed successfully.');
                resolve();
            } else {
                console.error(`❌ Python WhatsApp service failed with code ${code}`);
                reject(new Error(`Python process exited with code ${code}`));
            }
        });
    });
};
