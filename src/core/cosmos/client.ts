import { CosmosClient } from "@azure/cosmos"
import { Logger } from "../logger"

let clientInstance: CosmosClient | null = null

export const getCosmosClient = () => {
	// If we already have a connection, reuse it!
	if (clientInstance) {
		return clientInstance
	}

	// Otherwise, look for the key
	const connectionString = process.env.COSMOS_CONNECTION_STRING

	if (!connectionString) {
		// Critical failure. The app cannot function without memory.
		Logger.error("CRITICAL: COSMOS_CONNECTION_STRING is missing from environment variables.")
		throw new Error("COSMOS_CONNECTION_STRING is missing.")
	}

	Logger.info("⚡ Initializing new Cosmos Client Connection...")

	// Create the connection
	clientInstance = new CosmosClient(connectionString)
	return clientInstance
}
