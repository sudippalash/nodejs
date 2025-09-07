import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { updateDetailsRequest, updatePasswordRequest } from "../validations/ProfileRequest";
import { hashPassword, verifyPassword } from "../helpers/PasswordHelpers";
import { errorMessage } from "../helpers/ErrorHelpers";

const prisma = new PrismaClient();

class ProfileController {
  async updateDetails(req: Request, res: Response) {
    try {      
      const user = req.user;

      const validatedData = await updateDetailsRequest(user.id).parseAsync(req.body);

      await prisma.user.update({
        where: { id: user.id },
        data: validatedData,
      });

      return res.json({ success: true, message: "Details updated successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });      
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const user = req.user;

      const validatedData = updatePasswordRequest.parse(req.body);
      const { old_password, password } = validatedData;

      const valid = await verifyPassword(old_password, user.password);
      if (!valid) return res.status(400).json({ success: false, message: "Invalid old password" });

      const hashedPassword = await hashPassword(password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: errorMessage(err) });      
    }
  }
}

export default new ProfileController();