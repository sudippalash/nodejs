import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateDetailsRequest = (id: Number) => z.object({
    name: z.string().max(255),
    email: z.string().max(255).email(),
}).superRefine(async (data, ctx) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is already taken",
      });
    }
  });

export const updatePasswordRequest = z.object({
    old_password: z.string(),
    password: z.string().min(8).max(16),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match",
    path: ["password"],
});

export type UpdateDetailsInput = z.infer<ReturnType<typeof updateDetailsRequest>>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordRequest>;
