import { Bot, Context } from 'grammy'
import { getDatabase } from './db'
import { ObjectId, WithId } from 'mongodb'
import { ChatBot, ChatBotDb } from './types/ChatBot'
import { Chat, ChatDb } from './types/Chat'
import { Message } from 'ai'

const handleMessage = async (
	chat: WithId<Chat>,
	ctx: Context & { message: { text: string } }
) => {
	console.log('exec')
	const newMessageId =
		ctx.msgId?.toString() || (chat.messages.length + 1).toString()
	const newMessage: Message = {
		id: newMessageId,
		role: 'user',
		content: ctx.message.text,
	}

	const conversation: Message[] = [...chat.messages, newMessage]

	const url = `${process.env.API_URL}/${chat._id.toString()}/chat/basic`

	const response = await fetch(
		url,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: conversation }),
		}
	)
	const resp = await response.json()
	return ctx.reply(resp.reply || 'Error en la validación')
}

export async function createBotInstance(token: string, chatBotId: string) {
	const bot = new Bot(token)

	const db = await getDatabase()
	const chatBotsCollection = db.collection<ChatBotDb>('chatbot')
	const chatCollection = db.collection<ChatDb>('chat')

	const chatBotObjectId = new ObjectId(chatBotId)
	const chatBot = await chatBotsCollection.findOne({ _id: chatBotObjectId })

	if (!chatBot) return

	const name = chatBot.name

	bot.command('start', (ctx) =>
		ctx.reply(`¡Hola! Soy ${name}, tu asistente personalizado.`)
	)

	bot.on('message:text', async (ctx) => {
		const { chatId } = ctx

		let chat = await chatCollection.findOne({
			chatBotId: chatBotObjectId,
			name: chatId.toString(),
		})

		if (!chat) {
			const newChat = {
				chatBotId: chatBotObjectId,
				name: chatId.toString(),
				messages: [],
			}
			const result = await chatCollection.insertOne(newChat)
			if (result.acknowledged) {
				chat = {
					...newChat,
					_id: result.insertedId,
				}
			}
		}

		if (!chat) return
		return handleMessage(chat, ctx)
	})


	return bot
}
