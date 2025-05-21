import { CoreMessage, Message } from "ai"
import { ObjectId } from "mongodb"

export interface ChatRecord extends Chat {
    chatBotId: string
}

export interface ChatDb extends Chat {
    chatBotId: ObjectId,
}

export interface Chat {
    messages: Message[]
    name?: string,
    lastActive?: Date,
    
}