import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSchema = z.object({
  name: z.string().max(255),
  email: z.string().max(255).email(),
  password: z.string().min(8).max(16),
}).superRefine(async (data, ctx) => {
  // email unique
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Email is already taken",
    });
  }
});

export const updateSchema = (id: string) => z.object({
  name: z.string().max(255),
  email: z.string().max(255).email(),
  password: z.string().optional().refine((val) => !val || val.length >= 8, {
    message: "Password must be at least 8 characters",
  }),
}).superRefine(async (data, ctx) => {
  // email unique
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing && existing.id !== parseInt(id, 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Email is already taken",
    });
  }
});

// Types
export type CreateInput = z.infer<typeof createSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
