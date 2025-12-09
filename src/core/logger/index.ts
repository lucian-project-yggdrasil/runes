export type LogLevel = "info" | "warn" | "error" | "debug"

class RunesLogger {
	private isDev = process.env.NODE_ENV !== "production"

	private format(level: LogLevel, message: string, data?: unknown) {
		const timestamp = new Date().toISOString()

		if (this.isDev) {
			// Colors: Error=Red, Info=Cyan, Warn=Yellow
			const color = level === "error" ? "\x1b[31m" : level === "warn" ? "\x1b[33m" : "\x1b[36m"
			const reset = "\x1b[0m"

			console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`)
			if (data) console.dir(data, { depth: null, colors: true })
		} else {
			// For Azure Monitor / Log Analytics
			console.log(
				JSON.stringify({
					timestamp,
					level,
					message,
					data,
					app: process.env.WEBSITE_SITE_NAME || "Local",
				}),
			)
		}
	}

	info(message: string, data?: unknown) {
		this.format("info", message, data)
	}
	error(message: string, data?: unknown) {
		this.format("error", message, data)
	}
	warn(message: string, data?: unknown) {
		this.format("warn", message, data)
	}
	debug(message: string, data?: unknown) {
		this.format("debug", message, data)
	}
}

export const Logger = new RunesLogger()
