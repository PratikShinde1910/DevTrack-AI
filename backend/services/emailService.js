const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
    try {
        console.log(`Attempting to send OTP email to: ${email}`);

        // During testing with an unverified domain, Resend requires the 'from' email to be:
        // 'onboarding@resend.dev'
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'DevTrack AI <onboarding@resend.dev>',
            to: email,
            subject: 'Password Reset Verification Code',
            html: `
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this password reset, please ignore this email.</p>
            `,
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('OTP email triggered');
        }

        if (response.error) {
            console.error('Resend API returned an error:', response.error);
            throw new Error(response.error.message);
        }

        console.log(`Successfully sent OTP email to user.`);
        return response.data;
    } catch (error) {
        console.error('Error sending OTP email via Resend:', error.message);
        throw error;
    }
};

module.exports = { sendOtpEmail };
