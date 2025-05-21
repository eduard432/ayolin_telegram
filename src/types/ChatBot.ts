import { ObjectId } from 'mongodb'
import {
	IntegrationDb,
	IntegrationRecord,
	IntegrationType,
} from './Integration'

export interface ChatBotRecord extends ChatBot {
	defaultChatId: string
	userId: string
	_id: string
	chats: string[]
	integrations: IntegrationRecord[]
}

export interface ChatBotDb extends ChatBot {
	defaultChatId: ObjectId
	userId: ObjectId
	chats: ObjectId[]
	integrations: IntegrationDb[]
}

export interface ToolSetting {
	id: string
	settings: {
		[key: string]: string
	}
}

export interface ChatBot {
	name: string
	model: string
	initialPrompt: string
	tools: ToolSetting[]
	usedTokens: {
		input: number
		output: number
	}
	totalMessages: number
}
