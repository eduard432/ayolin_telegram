import { createBotInstance } from './chatBot'
import { getDatabase } from './db'
import { IntegrationDb } from './types/Integration'

export const initializeServer = async () => {
	const db = await getDatabase()
	const integrationsCollection = db.collection<IntegrationDb>('integrations')

	const integrations = await integrationsCollection
		.find({ type: 'tg' })
		.toArray()
	integrations.forEach(async (integration) => {
		const { chatBotId, config } = integration
		if (!config.token) return
		await createBotInstance(config.token, chatBotId.toString())
	})
}
