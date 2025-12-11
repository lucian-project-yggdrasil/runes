import { CosmosRepository } from "../core"
import { CONTAINERS } from "../core/constants"
import type { Friend, Interaction } from "./schemas"

export class FriendRepository extends CosmosRepository<Friend> {
	constructor() {
		super(CONTAINERS.FRIENDS)
	}

	async findByEmail(tenantId: string, email: string): Promise<Friend | null> {
		const results = await this.query(tenantId, "SELECT * FROM c WHERE c.email = @email", [
			{ name: "@email", value: email },
		])
		return results[0] || null
	}

	async logInteraction(
		friendId: string,
		tenantId: string,
		interaction: Interaction,
	): Promise<void> {
		const container = await this.getContainer()

		await container.item(friendId, tenantId).patch([
			// Note: "/interactions/-" appends, "/0" prepends (Reverse Chronological is better for UI)
			{ op: "add", path: "/interactions/0", value: interaction },
			{ op: "add", path: "/lastContactedAt", value: interaction.date },
		])
	}
}
