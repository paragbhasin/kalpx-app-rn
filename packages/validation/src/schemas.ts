import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Enter a valid email').optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
});

// Wire format matches BookingCreateRequest: POST public/bookings/create/
export const classBookingSchema = z.object({
  offering_id: z.number().int().positive(),
  scheduled_at: z.string().min(1, 'Select a time slot'),
  user_timezone: z.string().min(1),
  tutor_timezone: z.string().min(1),
  note: z.string().max(500).optional(),
  trial_selected: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ClassBookingInput = z.infer<typeof classBookingSchema>;
