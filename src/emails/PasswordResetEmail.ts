import { sendMail } from "../helpers/Mailer";

export async function passwordResetEmail(token: string, user: { name?: string; email: string }) {
    const resetLink = `${process.env.APP_URL}/password/reset?token=${token}&email=${user.email}`;
    await sendMail(
        user.email,
        "Password Reset Request",
        `
            <p>Hello ${user.name || ""},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>If you did not request this, ignore this email.</p>
        `
    );
}