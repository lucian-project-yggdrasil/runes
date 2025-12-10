import { z } from "zod"

// ==========================================
// 1. ENUMS & HELPERS
// ==========================================

export const FrequencySchema = z.enum([
	"weekly", // 7 days (Inner Circle)
	"monthly", // 30 days (Close Friends)
	"quarterly", // 90 days (Network)
	"yearly", // 365 days (Distant)
	"ad-hoc", // No pressure (Coworkers)
])
export const RelationshipStatusSchema = z.enum(["healthy", "decaying", "critical", "unknown"])

export const InteractionSchema = z.strictObject({
	id: z.uuid(),
	date: z.iso.datetime(), // ISO 8601
	type: z.enum(["call", "text", "meet", "social", "email"]),
	notes: z.string().optional(),
})

// ==========================================
// 2. THE FRIEND MODEL
// ==========================================

export const FriendSchema = z.strictObject({
	// Infrastructure
	id: z.uuid(), // UUID
	tenantId: z.string().min(1, "Tenant ID is required"), // Partition Key
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().optional(),

	// Identity
	name: z.string().min(1, "Name is required"),
	email: z.email().optional(),
	avatarUrl: z.url().optional(),

	// The Engine (Decay Algorithm)
	tier: z.enum(["inner", "outer", "network"]).default("network"),
	targetFrequency: FrequencySchema.default("monthly"),
	lastContactedAt: z.iso.datetime().optional(),

	// Context
	birthday: z
		.string()
		.regex(/^\d{2}-\d{2}$/, "Format MM-DD")
		.optional(),
	tags: z.array(z.string()).default([]),
	interactions: z.array(InteractionSchema).default([]),
})

export const CreateFriendSchema = FriendSchema.omit({
	id: true,
	tenantId: true,
	createdAt: true,
	updatedAt: true,
	interactions: true,
})

// ==========================================
// 3. INFERRED TYPES
// ==========================================

export type Frequency = z.infer<typeof FrequencySchema>
export type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>
export type Interaction = z.infer<typeof InteractionSchema>
export type Friend = z.infer<typeof FriendSchema>
export type CreateFriendDto = z.infer<typeof CreateFriendSchema>
