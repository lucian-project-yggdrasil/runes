import { z } from "zod"

// --- ENUMS ---
export const FrequencySchema = z.enum([
	"weekly", // 7 days
	"monthly", // 30 days
	"quarterly", // 90 days
	"yearly", // 365 days
	"ad-hoc", // No pressure
])
export const RelationshipStatusSchema = z.enum(["healthy", "decaying", "critical", "unknown"])

// --- SUB-MODELS ---
export const InteractionSchema = z.object({
	id: z.uuid(),
	date: z.iso.datetime(), // ISO 8601
	type: z.enum(["call", "text", "meet", "social", "email"]),
	notes: z.string().optional(),
})

// --- MAIN MODEL ---
export const FriendSchema = z.object({
	id: z.uuid().optional(),
	name: z.string().min(1, "Name is required"),
	email: z.email().optional(),
	avatarUrl: z.url().optional(),

	tier: z.enum(["inner", "outer", "network"]).default("network"),
	targetFrequency: FrequencySchema.default("monthly"),
	lastContactedAt: z.iso.datetime().optional(),

	birthday: z
		.string()
		.regex(/^\d{2}-\d{2}$/, "Format MM-DD")
		.optional(),
	tags: z.array(z.string()).default([]),
	interactions: z.array(InteractionSchema).default([]),
})

export type Frequency = z.infer<typeof FrequencySchema>
export type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>
export type Interaction = z.infer<typeof InteractionSchema>
export type Friend = z.infer<typeof FriendSchema>
