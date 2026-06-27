import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
});

// Org onboarding: first user becomes the org ADMIN.
export const registerSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10).max(200),
});

// Self-serve join via a shareable org code. Role + org are resolved server-side
// from the code — never trusted from the client.
export const joinSchema = z.object({
  code: z.string().trim().min(8).max(64),
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
