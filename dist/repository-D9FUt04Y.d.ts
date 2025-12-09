import { Container, JSONValue } from '@azure/cosmos';

interface BaseEntity {
    id: string;
    tenantId: string;
}
declare abstract class CosmosRepository<T extends BaseEntity> {
    private containerName;
    private container;
    constructor(containerName: string);
    /**
     * Lazy-loads the container.
     * Ensures we reuse the Single Connection from 'client.ts'.
     */
    protected getContainer(): Promise<Container>;
    create(item: T): Promise<T>;
    get(id: string, tenantId: string): Promise<T | null>;
    fetchAll(tenantId: string): Promise<T[]>;
    update(item: T): Promise<T>;
    delete(id: string, tenantId: string): Promise<void>;
    /**
     * Custom Query
     * Allows specific WHERE clauses, but forces Tenant ID injection.
     */
    query(tenantId: string, query: string, parameters?: {
        name: string;
        value: JSONValue;
    }[]): Promise<T[]>;
}

export { type BaseEntity as B, CosmosRepository as C };
