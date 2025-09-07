import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { loginRequest, registerRequest, passwordRequest, resetRequest } from "../validations/AuthRequest";
import { hashPassword, verifyPassword } from "../helpers/PasswordHelpers";
import { errorMessage } from "../helpers/ErrorHelpers";
import { verifyEmail, passwordResetEmail } from "../emails/AuthEmail";

const prisma = new PrismaClient();

class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginRequest.parse(req.body);
      const { email, password } = validatedData;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

      const valid = await verifyPassword(password, user.password);
      if (!valid) return res.status(400).json({ success: false, message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      return res.json({ success: true, message: 'Login Successfully', token });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const validatedData = await registerRequest.parseAsync(req.body);
            validatedData.password = await hashPassword(validatedData.password);

      // userData contains everything except password_confirmation
      const { password_confirmation, ...userData } = validatedData;

      const user = await prisma.user.create({
        data: userData
      });

      // Generate verify token
      const verifyToken = jwt.sign(
        { userId: user.id, purpose: "register" },
        process.env.JWT_SECRET as string,
        { expiresIn: "120m" }
      );

      // Send verify email
      await verifyEmail(verifyToken, { name: user.name, email: user.email });

      res.json({success: true, message: "A new verification link has been sent to the email address you provided during registration."});
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async emailVerify(req: Request, res: Response) {
    try {
      const { hash } = req.params;

      const decoded = jwt.verify(hash, process.env.JWT_SECRET as string) as {
        userId: number;
        purpose: string;
      };

      if (decoded.purpose !== "register") {
        throw new Error("Invalid or expired link");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      if (!user) throw new Error("User not found");

      if (user.email_verified_at) throw new Error("Your email already verified!");

      await prisma.user.update({
        where: { id: user.id },
        data: { email_verified_at: new Date() },
      });

      return res.json({ success: true, message: "Your email has been successfully verified!" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async emailResend(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (user.email_verified_at) throw new Error("Your email already verified!");

      // Generate verify token
      const verifyToken = jwt.sign(
        { userId: user.id, purpose: "register" },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      // Send verify email
      await verifyEmail(verifyToken, { name: user.name, email: user.email });

      res.json({success: true, message: "A new verification link has been sent to the email address you provided during registration."});
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const validatedData = passwordRequest.parse(req.body);
      const { email } = validatedData;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // Generate random token (not JWT)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash before saving
      const hashedToken = await hashPassword(resetToken, 10);

      // Delete old reset tokens for this email
      await prisma.passwordReset.deleteMany({ where: { email } });

      // Store new reset token
      await prisma.passwordReset.create({
        data: {
          email: user.email,
          token: hashedToken,
        },
      });

      // Send email with reset link
      await passwordResetEmail(resetToken, { name: user.name, email: user.email });

      return res.json({
        success: true,
        message: "We have emailed your password reset link.",
        resetToken,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const validatedData = resetRequest.parse(req.body);
      const { token, email, password } = validatedData;

      // Find reset record
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
      });

      if (!resetRecord) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }

      // Check expiry (valid for 60 minutes)
      const tokenAgeMinutes = (Date.now() - resetRecord.createdAt.getTime()) / (1000 * 60);
      if (tokenAgeMinutes > 60) {
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
        return res.status(400).json({ success: false, message: "Token expired" });
      }

      // Compare token
      const isMatch = await verifyPassword(token, resetRecord.token);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid token" });
      }

      // Update user password
      const hashedPassword = await hashPassword(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Delete all reset tokens for this email
      await prisma.passwordReset.deleteMany({ where: { email } });

      return res.json({ success: true, message: "Password reset successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true },
    });

    return res.json({ success: true, data: user });
  }

  // Logout (JWT → client just deletes token)
  static async logout(req: Request, res: Response) {
    // With JWT, logout is usually handled client-side (delete token).
    // If you want "blacklist" logic, you'd store invalid tokens in DB/Redis.
    return res.json({ success: true, message: "Logged out Successfully" });
  }
}

export default AuthController;
