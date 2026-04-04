import { z } from "zod";

export const SignupSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
  password: z.string().min(1, "Password is required"),
});

export const WatchLogCreateSchema = z.object({
  tmdbId: z.number().int().optional(),
  title: z.string().min(1, "Title is required").max(500),
  posterUrl: z.string().url().optional().nullable(),
  genre: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  emotions: z.array(z.string()).default([]),
  platform: z.string().optional().nullable(),
  reviewText: z.string().max(5000).optional().nullable(),
  watchStatus: z.enum(["WATCHED", "TO_WATCH"]).default("WATCHED"),
  watchedAt: z.string().datetime().optional().nullable(),
});

export const WatchLogUpdateSchema = WatchLogCreateSchema.partial();

export const ProfileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim()
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()
    .optional()
    .nullable(),
  image: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
});

export const CollectionCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const CollectionUpdateSchema = CollectionCreateSchema.partial();

export const CollectionItemSchema = z.object({
  watchLogId: z.string().cuid("Invalid log ID"),
  order: z.number().int().min(1).optional().nullable(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type WatchLogCreateInput = z.infer<typeof WatchLogCreateSchema>;
export type WatchLogUpdateInput = z.infer<typeof WatchLogUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type CollectionCreateInput = z.infer<typeof CollectionCreateSchema>;
export type CollectionUpdateInput = z.infer<typeof CollectionUpdateSchema>;
export type CollectionItemInput = z.infer<typeof CollectionItemSchema>;
