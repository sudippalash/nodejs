import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../helpers/PasswordHelpers";

const prisma = new PrismaClient();

class UserController {
    // GET /users
    async index(req: Request, res: Response) {
      const users = await prisma.user.findMany();
      res.json({success: true, message: null, data: users});
    }
  
    // GET /users/:id
    async show(req: Request, res: Response) {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: Number(id) }
      });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({success: true, message: null, data: user});
    }
  
    // POST /users
    async store(req: Request, res: Response) {
      const { name, email, password } = req.body;
      const hashedPassword = await hashPassword(password);
      try {
        const user = await prisma.user.create({
          data: { name, email, password : hashedPassword }
        });
        res.json({success: true, message: null, data: user});
      } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  
    // PUT /users/:id
    async update(req: Request, res: Response) {
      const { id } = req.params;
      const { name, email } = req.body;
      try {
        const user = await prisma.user.update({
          where: { id: Number(id) },
          data: { name, email }
        });
        res.json({success: true, message: null, data: user});
      } catch (error) {
        res.status(404).json({ success: false, message: "User not found" });
      }
    }
  
    // DELETE /users/:id
    async destroy(req: Request, res: Response) {
      const { id } = req.params;
      try {
        await prisma.user.delete({
          where: { id: Number(id) }
        });
        res.json({success: true, message: `User ${id} deleted` });
      } catch (error) {
        res.status(404).json({ success: false, message: "User not found" });
      }
    }
  }

export default new UserController();
