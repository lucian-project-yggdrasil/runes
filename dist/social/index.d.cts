import { z } from 'zod';
import { C as CosmosRepository } from '../repository-D9FUt04Y.cjs';
import '@azure/cosmos';

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
}, z.core.$strict>;
declare const FriendSchema: z.ZodObject<{
    id: z.ZodUUID;
    tenantId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodISODateTime>;
    updatedAt: z.ZodOptional<z.ZodISODateTime>;
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
    }, z.core.$strict>>>;
}, z.core.$strict>;
type Frequency = z.infer<typeof FrequencySchema>;
type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>;
type Interaction = z.infer<typeof InteractionSchema>;
type Friend = z.infer<typeof FriendSchema>;

/**
 * Calculates the health of a relationship based on frequency targets.
 */
declare const getRelationshipStatus: (friend: Friend) => RelationshipStatus;

declare class FriendRepository extends CosmosRepository<Friend> {
    constructor();
    findByEmail(tenantId: string, email: string): Promise<Friend | null>;
}

export { type Frequency, FrequencySchema, type Friend, FriendRepository, FriendSchema, type Interaction, InteractionSchema, type RelationshipStatus, RelationshipStatusSchema, getRelationshipStatus };
