import dotenv from 'dotenv'
import { connectToDatabase } from './db'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { initializeServer } from './initializeServer'

dotenv.config()

const PORT = process.env.PORT || 4000
const app = express()

app.disable('x-powered-by')
app.use(cors()) // Primero permite CORS
app.use(express.json()) // Luego maneja solicitudes JSON
app.use(morgan('dev')) // Y por último el logging

app.listen(PORT, async () => {
	await connectToDatabase()
	await initializeServer()
	console.log(`Server running on port: ${PORT}`)
})
