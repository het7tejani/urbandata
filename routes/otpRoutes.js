import express from 'express';
import OTP from '../models/otpModel.js';

const router = express.Router();

// Generate and Send OTP
router.post('/send', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // Clear previous OTPs for this phone
        await OTP.deleteMany({ phone });

        // Save new OTP
        await OTP.create({ phone, otp });

        // --- REAL SMS SENDING LOGIC WOULD GO HERE ---
        // Example with Twilio:
        // client.messages.create({ body: `Your UrbanPantry OTP is ${otp}`, from: '+1234567890', to: phone });
        


        res.status(200).json({ message: 'OTP sent successfully', mockOtp: otp }); // mockOtp returned only for testing
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify OTP
router.post('/verify', async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    try {
        const otpRecord = await OTP.findOne({ phone, otp });

        if (otpRecord) {
            // Valid OTP
            await OTP.deleteMany({ phone }); // Remove after use
            res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
