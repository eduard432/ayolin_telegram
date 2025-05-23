import dotenv from 'dotenv'
import { connectToDatabase, getDatabase } from './db'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { initializeServer } from './initializeServer'
import { handleApiError } from './handleError'
import { validateWithSource } from './validate'
import { z } from 'zod'
import { IntegrationDb } from './types/Integration'
import { ObjectId } from 'mongodb'
import { createBotInstance } from './chatBot'
import { Bot } from 'grammy'

dotenv.config()

const PORT = process.env.PORT || 4000
const app = express()

app.disable('x-powered-by')
app.use(cors()) // Primero permite CORS
app.use(express.json()) // Luego maneja solicitudes JSON
app.use(morgan('dev')) // Y por último el logging

app.get('/test/:integrationId', (req, res) => {
	const params = req.params
	const { integrationId } = validateWithSource(paramsSchema, params, 'params')
	console.log({ integrationId })
	res.json({
		msg: 'Hola',
	})
})

const paramsSchema = z.object({
	integrationId: z.string(),
})

const activeBots = new Map<string, Bot>()

app.post('/webhook/:integrationId/launch', async (req, res) => {
	try {
		const params = req.params
		const { integrationId } = validateWithSource(
			paramsSchema,
			params,
			'params'
		)
		const ingtegrationObjectId = new ObjectId(integrationId)

		const db = await getDatabase()
		const integrationsCollection = db.collection<IntegrationDb>('integrations')

		const integration = await integrationsCollection.findOne({
			_id: ingtegrationObjectId,
		})

		if (!integration) {
			res
				.json({
					msg: 'Integration not found',
					acknowledge: false,
				})
				.status(404)
			return
		}

		if (!integration.settings.token) {
			res
				.json({
					msg: 'Token not found',
					acknowledge: false,
				})
				.status(400)
			return
		}

		const bot = await createBotInstance(
			integration.settings.token,
			integration.chatBotId.toString()
		)

		if (!bot) {
			res.json({
				msg: 'Chatbot not found',
				acknowledge: false,
			})
			return
		}

		if (!process.env.DOMAIN_URL) throw Error('DOMAIN_URL missing')

		const endpoint = `${
			process.env.DOMAIN_URL
		}/webhook/${integration._id.toString()}`

		await bot.api.setWebhook(endpoint)
		activeBots.set(integration._id.toString(), bot)

		res.json({
			msg: 'Chatbot webhook set',
			acknowledge: true,
		})
	} catch (error) {
		return handleApiError(error, res)
	}
})

app.delete('/webhook/:integrationId/launch', async (req, res) => {
	try {
		const params = req.params
		const { integrationId } = validateWithSource(
			paramsSchema,
			params,
			'params'
		)
		const bot = activeBots.get(integrationId)

		if(!bot) {
			res.json({
				msg: 'Chatbot not found',
				acknowledge: false
			})
			return
		}

		await bot.api.deleteWebhook()
		activeBots.delete(integrationId)
	} catch (error) {
		return handleApiError(error,res)
	}
})

app.post('/webhook/:integrationId', async (req, res) => {
	try {
		const params = req.params
		const { integrationId } = validateWithSource(
			paramsSchema,
			params,
			'params'
		)

		const bot = activeBots.get(integrationId)
		if (!bot) {
			res.status(404).send('Bot not found')
			return
		}
		await bot.handleUpdate(req.body)
		res.status(200).send('OK')
	} catch (error) {
		return handleApiError(error, res)
	}
})

app.listen(PORT, async () => {
	const db = await connectToDatabase()
	// await initializeServer()
	const integrationsCollection = db.collection<IntegrationDb>('integrations')

	const integrations = await integrationsCollection
		.find({ type: 'tg' })
		.toArray()
	integrations.forEach(async (integration) => {
		const { chatBotId, settings } = integration
		if (!settings.token) return
		const bot = await createBotInstance(settings.token, chatBotId.toString())
		if (!bot) return

		if (!process.env.DOMAIN_URL) throw Error('DOMAIN_URL missing')

		const endpoint = `${
			process.env.DOMAIN_URL
		}/webhook/${integration._id.toString()}`

		await bot.api.setWebhook(endpoint)
		activeBots.set(integration._id.toString(), bot)
	})
	console.log(`Server running on port: ${PORT}`)
})
