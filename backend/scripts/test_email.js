require('dotenv').config();
const nodemailer = require('nodemailer');

// Force load env from parent directory if running from scripts/
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    console.log('--- Testing Email Configuration ---');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Don't log full password
    console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'Not Set'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: EMAIL_USER or EMAIL_PASS not set in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Sending test email to self...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'EcoFarming SMTP Test',
            text: 'If you see this, your email configuration is working correctly!'
        });

        console.log('✅ Test Email Sent!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error) {
        console.error('❌ Email Test Failed:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
        console.log('\nTroubleshooting Tips:');
        console.log('1. Ensure "2-Step Verification" is ON for your Google Account.');
        console.log('2. Generate an "App Password" and use it as EMAIL_PASS.');
        console.log('3. Do NOT use your regular Gmail password.');
    }
}

testEmail();
