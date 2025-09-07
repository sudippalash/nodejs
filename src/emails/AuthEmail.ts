import { sendMail } from "../helpers/Mailer";

export async function verifyEmail(token: string, user: { name?: string; email: string }) {
    const resetLink = `${process.env.APP_URL}/email/verify/${token}`;
    await sendMail(
        user.email,
        "Verify Email Address",
        `
            <p>Hello ${user.name || ""},</p>
            <p>Please click the button below to verify your email address.</p>
            <p><a href="${resetLink}">Verify Email Address</a></p>
            <p>If you did not create an account, no further action is required.</p>
            <p>Regards,<br />${process.env.APP_NAME || ''}</p>
            <hr />
            <p>
                If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser: 
                <a href="${resetLink}">${resetLink}</a>
            </p>
        `
    );
}

export async function passwordResetEmail(token: string, user: { name?: string; email: string }) {
    const resetLink = `${process.env.APP_URL}/password/reset?token=${token}&email=${user.email}`;
    await sendMail(
        user.email,
        "Reset Password Notification",
        `
            <p>Hello ${user.name || ""},</p>
            <p>You are receiving this email because we received a password reset request for your account.</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>This password reset link will expire in 60 minutes.</p>
            <p>If you did not request a password reset, no further action is required.</p>
            <p>Regards,<br />${process.env.APP_NAME || ''}</p>
            <hr />
            <p>If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser: 
                <a href="${resetLink}">${resetLink}</a>
            </p>
        `
    );
}