import { z } from 'zod';

declare const FrequencySchema: z.ZodEnum<{
    weekly: "weekly";
    monthly: "monthly";
    quarterly: "quarterly";
    yearly: "yearly";
    "ad-hoc": "ad-hoc";
}>;
declare const RelationshipStatusSchema: z.ZodEnum<{
    healthy: "healthy";
    decaying: "decaying";
    critical: "critical";
    unknown: "unknown";
}>;
declare const InteractionSchema: z.ZodObject<{
    id: z.ZodUUID;
    date: z.ZodISODateTime;
    type: z.ZodEnum<{
        call: "call";
        text: "text";
        meet: "meet";
        social: "social";
        email: "email";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const FriendSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodUUID>;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodEmail>;
    avatarUrl: z.ZodOptional<z.ZodURL>;
    tier: z.ZodDefault<z.ZodEnum<{
        inner: "inner";
        outer: "outer";
        network: "network";
    }>>;
    targetFrequency: z.ZodDefault<z.ZodEnum<{
        weekly: "weekly";
        monthly: "monthly";
        quarterly: "quarterly";
        yearly: "yearly";
        "ad-hoc": "ad-hoc";
    }>>;
    lastContactedAt: z.ZodOptional<z.ZodISODateTime>;
    birthday: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    interactions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        date: z.ZodISODateTime;
        type: z.ZodEnum<{
            call: "call";
            text: "text";
            meet: "meet";
            social: "social";
            email: "email";
        }>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type Frequency = z.infer<typeof FrequencySchema>;
type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>;
type Interaction = z.infer<typeof InteractionSchema>;
type Friend = z.infer<typeof FriendSchema>;

/**
 * Calculates the health of a relationship based on frequency targets.
 */
declare const getRelationshipStatus: (friend: Friend) => RelationshipStatus;

export { type Frequency, FrequencySchema, type Friend, FriendSchema, type Interaction, InteractionSchema, type RelationshipStatus, RelationshipStatusSchema, getRelationshipStatus };
