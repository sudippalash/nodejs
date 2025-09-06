import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Login
export const loginRequest = z.object({
    email: z.string().max(255).email(),
    password: z.string(),
});

// Register
export const registerRequest = z.object({
    name: z.string().max(255),
    email: z.string().max(255).email(),
    password: z.string().min(8).max(16),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match",
    path: ["password"],
}).superRefine(async (data, ctx) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["email"],
            message: "Email is already taken",
        });
    }
});

// Forgot password
export const passwordRequest = z.object({
    email: z.string().max(255).email(),
});

// Reset password
export const resetRequest = z.object({
    token: z.string(),
    password: z.string().min(8).max(16),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match",
    path: ["password"],
});

// Reset password
export const changePasswordRequest = z.object({
    old_password: z.string(),
    password: z.string().min(8).max(16),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match",
    path: ["password"],
});
  
export type LoginInput = z.infer<typeof loginRequest>;
export type RegisterInput = z.infer<typeof registerRequest>;
export type PasswordInput = z.infer<typeof passwordRequest>;
export type ResetInput = z.infer<typeof resetRequest>;
export type ChangePasswordInput = z.infer<typeof changePasswordRequest>;
