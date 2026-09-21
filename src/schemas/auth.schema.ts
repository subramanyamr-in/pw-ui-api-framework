import { z } from 'zod';

/**
 * Authentication request payload schema.
 */
export const LoginRequestSchema = z.object({
  email: z.email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Authentication response payload schema.
 */
export const LoginResponseSchema = z.object({
  token: z.string().min(1, 'Token must not be empty'),
  user: z.object({
    id: z.union([z.string(), z.number()]),
    email: z.email(),
    role: z.string().optional(),
    name: z.string().optional(),
  }),
  expiresIn: z.number().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
