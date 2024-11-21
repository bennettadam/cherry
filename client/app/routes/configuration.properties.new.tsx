import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useActionData, useSubmit } from '@remix-run/react'
import type { PropertyFormData } from '~/components/PropertyForm'
import PropertyForm from '~/components/PropertyForm'
import { Route, APIRoute } from '~/utility/Routes'

export async function action({ request }: ActionFunctionArgs) {
	try {
		const response = await fetch(APIRoute.properties, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: await request.text(),
		})

		if (!response.ok) {
			throw new Error('Failed to create property')
		}

		return redirect(Route.viewProperties)
	} catch (error) {
		return Response.json(
			{ error: 'Failed to create property' },
			{ status: 400 }
		)
	}
}

export default function NewProperty() {
	const actionData = useActionData<typeof action>()
	const submit = useSubmit()

	const handleSubmit = (data: PropertyFormData) => {
		submit(data, { method: 'post', encType: 'application/json' })
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Property
				</h2>
			</div>

			<PropertyForm
				onSubmit={handleSubmit}
				error={actionData?.error}
				submitLabel="Create Property"
			/>
		</div>
	)
}
