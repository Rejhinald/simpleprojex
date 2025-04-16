import { z } from "zod";

export const personalInfoSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(50, { message: "Username cannot exceed 50 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
      .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
      .regex(/[0-9]/, { message: "Password must include a number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const contactInfoSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
});

export const verificationSchema = z.object({
  otp: z.string().length(6, { message: "OTP code must be 6 digits" }),
});