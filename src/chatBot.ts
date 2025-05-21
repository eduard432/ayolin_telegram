import { Bot } from 'grammy'

export async function createBotInstance(token: string, chatBotId: string) {
	const name = 'tu asistente personalizado generado con ayolin' // Cambia esto por el nombre que desees
	const bot = new Bot(token)

	bot.command('start', (ctx) =>
		ctx.reply(`¡Hola! Soy ${name}, tu asistente personalizado.`)
	)

	bot.on('message:text', (ctx) =>
		ctx.reply(`Soy ${name} y recibí tu mensaje: ${ctx.message.text}`)
	)

	// Inicia el bot en modo polling
	bot
		.start()
		.then(() => {
			console.log(`${name} iniciado con éxito.`)
		})
		.catch((err) => {
			console.error(`Error iniciando ${name}:`, err.message)
		})

	return bot
}
