import { z } from 'zod';

declare class BaseRepository<T extends {
    id: string;
    tenantId: string;
}> {
    private connectionString;
    private databaseName;
    private containerName;
    private container;
    constructor(connectionString: string, databaseName: string, containerName: string);
    private getContainer;
    findByTenant(tenantId: string, querySpec?: string): Promise<T[]>;
    create(item: T): Promise<T>;
}

declare const FriendSchema: z.ZodObject<{
    id: z.ZodUUID;
    tenantId: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        Cold: "Cold";
        Warm: "Warm";
        Hot: "Hot";
    }>;
    createdAt: z.ZodISODateTime;
    email: z.ZodOptional<z.ZodEmail>;
    location: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const CreateFriendSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodEmail>;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        Cold: "Cold";
        Warm: "Warm";
        Hot: "Hot";
    }>>;
}, z.core.$strip>;
type Friend = z.infer<typeof FriendSchema>;
type CreateFriendDto = z.infer<typeof CreateFriendSchema>;

declare const greet: (name: string) => string;

export { BaseRepository, type CreateFriendDto, CreateFriendSchema, type Friend, FriendSchema, greet };
