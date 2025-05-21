import { ObjectId } from 'mongodb'

export type IntegrationType = 'wa' | 'tg'

export interface IntegrationDb extends Integration {
	chatBotId: ObjectId
}

export interface IntegrationRecord extends Integration {
	_id: string
	chatBotId: string
}

export interface Integration {
	type: IntegrationType
	users: string[]
	config: {
		[key: string]: string
	}
}
