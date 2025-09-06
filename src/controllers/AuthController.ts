import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { loginRequest, registerRequest, passwordRequest, resetRequest, changePasswordRequest } from "../validations/AuthRequest";
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
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
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

      // Generate reset token (in real app, send via email)
      const resetToken = jwt.sign(
        { userId: user.id, purpose: "password-reset" },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      // Send email with reset link
      await passwordResetEmail(resetToken, { name: user.name || "", email: user.email });

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
      const { token, password } = validatedData;

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number;
        purpose: string;
      };

      if (decoded.purpose !== "password-reset") {
        throw new Error("Invalid or expired token");
      }

      const hashedPassword = await hashPassword(password, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      return res.json({ success: true, message: "Password reset successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });
    }
  }

  static async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true },
    });

    return res.json({ success: true, data: user });
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const validatedData = changePasswordRequest.parse(req.body);
      const { old_password, password } = validatedData;

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const valid = await verifyPassword(old_password, user.password);
      if (!valid) return res.status(400).json({ success: false, message: "Invalid old password" });

      const hashedPassword = await hashPassword(password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return res.json({ success: true, message: "Password updated" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });      
    }
  }

  // Logout (JWT → client just deletes token)
  static async logout(req: Request, res: Response) {
    // With JWT, logout is usually handled client-side (delete token).
    // If you want "blacklist" logic, you'd store invalid tokens in DB/Redis.
    return res.json({ success: true, message: "Logged out Successfully" });
  }
}

export default AuthController;
