import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useActionData, useSubmit } from '@remix-run/react'
import type { PropertyFormData } from '~/components/PropertyForm'
import PropertyForm, { PropertyFormMode } from '~/components/PropertyForm'
import { Route, APIRoute } from '~/utility/Routes'
import { APIClient } from '~/utility/APIClient'
import { Tools } from '~/utility/Tools'
import { ErrorResponse } from '../models/types'

export async function action({ request }: ActionFunctionArgs) {
	try {
		await APIClient.post(APIRoute.properties, {
			body: await request.json(),
		})

		return redirect(Route.viewProperties)
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), { status: 400 })
	}
}

export default function NewProperty() {
	const actionData = useActionData<ErrorResponse>()
	const submit = useSubmit()

	const handleSubmit = (data: PropertyFormData) => {
		submit(data, { method: 'post', encType: 'application/json' })
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Property
				</h2>
			</div>

			<PropertyForm
				mode={PropertyFormMode.create}
				onSubmit={handleSubmit}
				error={actionData?.message}
				submitLabel="Create Property"
			/>
		</div>
	)
}
