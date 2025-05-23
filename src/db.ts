// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { Db, MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.MONGODB_URI) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: false,
		deprecationErrors: true,
	},
}

let client: MongoClient

if (process.env.NODE_ENV === 'development') {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	let globalWithMongo = global as typeof globalThis & {
		_mongoClient?: MongoClient
	}

	if (!globalWithMongo._mongoClient) {
		globalWithMongo._mongoClient = new MongoClient(uri, options)
	}
	client = globalWithMongo._mongoClient
} else {
	// In production mode, it's best to not use a global variable.
	client = new MongoClient(uri, options)
}

let db: Db

export async function connectToDatabase() {
	try {
		if (!db) {
			await client.connect() // Conecta al cliente si no está conectado
			db = client.db('chatbot_db') // Inicializa la base de datos
		}
		return db
	} catch (error) {
		console.error('Error al conectar a la base de datos:', error)
		throw error
	}
}

export async function getDatabase() {
	if (!db) {
		await connectToDatabase()
	}
	return db
}

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
export default client
