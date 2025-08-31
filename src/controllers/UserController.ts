import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../helpers/PasswordHelpers";
import { errorMessage } from "../helpers/ErrorHelpers";

const prisma = new PrismaClient();

class UserController {
    // GET /users
    async index(req: Request, res: Response) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 2;
      const skip = (page - 1) * limit;

      const { status, name, email } = req.query;

      let filterData: any = {};
      if (status) {
        filterData.status = status;
      }
      if (name) {
        filterData.name = name;
      }
      if (email) {
        filterData.email = email;
      }

      const users = await prisma.user.findMany({
        where: filterData,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          status: true,
        },
      });

      // Total count for pagination
      const total = await prisma.user.count({
        where: filterData,
      });

      const data = {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        data: users
      }
      res.json({success: true, message: null, data});
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
      const schema = z.object({
        name: z.string().nonempty().max(255),
        email: z.string().nonempty().max(255).email(),
        password: z.string().min(8).max(16),
      });

      try {
        const validatedData = schema.parse(req.body);
        validatedData.password = await hashPassword(validatedData.password);

        const user = await prisma.user.create({
          data: validatedData
        });
        res.json({success: true, message: null, data: user});
      } catch (err: any) {
        res.status(400).json({ success: false, message: errorMessage(err) });
      }
    }
  
    // PUT /users/:id
    async update(req: Request, res: Response) {
      const schema = z.object({
        name: z.string().nonempty().max(255),
        email: z.string().nonempty().max(255).email(),
        password: z.string().optional().refine((val) => !val || val.length >= 8, {
          message: "Password must be at least 8 characters",
        }),
      });

      try {
        const { id } = req.params;
        const validatedData = schema.parse(req.body);
        if (validatedData.password) {
          validatedData.password = await hashPassword(validatedData.password);
        }

        const user = await prisma.user.update({
          where: { id: Number(id) },
          data: validatedData
        });
        res.json({success: true, message: null, data: user});
      } catch (err: any) {
        res.json({ success: false, message: errorMessage(err) });
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
      } catch (err: any) {
        res.status(404).json({ success: false, message: err.message || "User not found" });
      }
    }
  }

export default new UserController();
