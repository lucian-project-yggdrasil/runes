import type { Container, JSONValue, SqlQuerySpec } from "@azure/cosmos"
import { YGGDRASIL_DB } from "../constants"
import { Logger } from "../logger"
import { getCosmosClient } from "./client"

interface CosmosError {
	code?: number
	message?: string
	body?: unknown
}

export interface BaseEntity {
	id: string // UUID
	tenantId: string // Partition Key
}

export abstract class CosmosRepository<T extends BaseEntity> {
	private container: Container | null = null

	constructor(private containerName: string) {}

	/**
	 * Lazy-loads the container.
	 * Ensures we reuse the Single Connection from 'client.ts'.
	 */
	protected async getContainer(): Promise<Container> {
		if (!this.container) {
			const client = getCosmosClient()
			const database = client.database(YGGDRASIL_DB)

			// Auto-provision container if missing
			const { container } = await database.containers.createIfNotExists({
				id: this.containerName,
				partitionKey: "/tenantId",
			})

			this.container = container
		}
		return this.container
	}

	async create(item: T): Promise<T> {
		const container = await this.getContainer()
		Logger.info(`[Cosmos] Creating item in ${this.containerName}`, { id: item.id })

		const { resource } = await container.items.create(item)
		return resource as T
	}

	async get(id: string, tenantId: string): Promise<T | null> {
		const container = await this.getContainer()

		try {
			const { resource } = await container.item(id, tenantId).read()
			return (resource as T) || null
		} catch (error: unknown) {
			// Non-existing item
			const cosmosError = error as CosmosError
			if (cosmosError.code === 404) return null
			throw error
		}
	}

	async fetchAll(tenantId: string): Promise<T[]> {
		const container = await this.getContainer()

		const querySpec: SqlQuerySpec = {
			query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
			parameters: [{ name: "@tenantId", value: tenantId }],
		}

		const { resources } = await container.items.query(querySpec).fetchAll()
		return resources as T[]
	}

	async update(item: T): Promise<T> {
		const container = await this.getContainer()
		const { resource } = await container.items.upsert<T>(item)
		return resource as T
	}

	async delete(id: string, tenantId: string): Promise<void> {
		const container = await this.getContainer()
		await container.item(id, tenantId).delete()
	}

	/**
	 * Custom Query
	 * Allows specific WHERE clauses, but forces Tenant ID injection.
	 */
	async query(
		tenantId: string,
		query: string,
		parameters: { name: string; value: JSONValue }[] = [],
	): Promise<T[]> {
		const container = await this.getContainer()
		const safeQuery = `${query} AND c.tenantId = @tenantId`

		const querySpec: SqlQuerySpec = {
			query: safeQuery,
			parameters: [...parameters, { name: "@tenantId", value: tenantId }],
		}

		const { resources } = await container.items.query(querySpec).fetchAll()
		return resources as T[]
	}
}
