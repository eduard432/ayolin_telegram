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
		const { chatBotId, settings } = integration
		if (!settings.token) return
		await createBotInstance(settings.token, chatBotId.toString())
	})
}
