export * from "./cosmos/client"
export * from "./cosmos/repository"
export * from "./logger"

export const greet = (name: string): string => {
	return `Skål, ${name}! The Core Runes are active.`
}
