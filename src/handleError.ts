import { ZodErrorWithSource } from './validate'
import { ZodError } from 'zod'
import { Response } from 'express'

export function handleApiError(error: unknown, res: Response) {
	if (error instanceof ZodError) {
		const source = (error as ZodErrorWithSource).source || 'unknown'

		res
			.json({
				error: `Validation error in ${source}`,
				issues: error.flatten(),
			})
			.status(422)

		return
	}

	console.log((error as Error)?.message)

	res
		.json({
			error: 'Unexpected error',
			message: 'Unknown server error',
		})
		.status(500)
}
