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

// Wire: POST /posts/ — content field (not body); community slug optional on web
export const communityPostSchema = z.object({
  content: z.string().trim().min(1, 'Post cannot be empty').max(2000, 'Post is too long (max 2000 characters)'),
  title: z.string().trim().max(120, 'Title is too long (max 120 characters)').optional(),
  community: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Wire: POST /comments/ — content field (not body)
export const communityCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long (max 1000 characters)'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ClassBookingInput = z.infer<typeof classBookingSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type CommunityCommentInput = z.infer<typeof communityCommentSchema>;

// Wire: POST /interests/ with type: "retreats"
export const retreatInterestSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  locations: z.array(z.string()).min(1, 'Select at least one location'),
  userCity: z.string().optional(),
  duration: z.enum(['3_days', '7_days', '10_plus_days']),
  experience: z.enum(['essencial', 'comfort', 'premium']),
  spiritualIntent: z.string().max(500).optional(),
});
export type RetreatsInterestInput = z.infer<typeof retreatInterestSchema>;
