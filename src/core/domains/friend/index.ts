import { z } from "zod"

export const FriendSchema = z.object({
	id: z.uuid(),
	tenantId: z.string(),
	name: z.string().min(1, "Name is required"),
	status: z.enum(["Cold", "Warm", "Hot"]),
	createdAt: z.iso.datetime(),
	email: z.email().optional(),
	location: z.string().optional(),
})

export const CreateFriendSchema = FriendSchema.pick({
	name: true,
	email: true,
	location: true,
}).extend({
	status: z.enum(["Cold", "Warm", "Hot"]).default("Warm"),
})

export type Friend = z.infer<typeof FriendSchema>
export type CreateFriendDto = z.infer<typeof CreateFriendSchema>
