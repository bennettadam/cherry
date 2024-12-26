import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import { useActionData, useOutletContext, useSubmit } from '@remix-run/react'
import type { PropertyFormData } from '~/components/PropertyForm'
import PropertyForm, { PropertyFormMode } from '~/components/PropertyForm'
import { APIRoute, Route } from '~/utility/Routes'
import {
	ErrorResponse,
	PropertyConfigurationDetailsOutletContext,
} from '~/models/types'
import { APIClient } from '~/utility/APIClient'
import { Tools } from '~/utility/Tools'

export async function action({ request, params }: ActionFunctionArgs) {
	const propertyID = params.propertyID
	if (!propertyID) {
		throw new Response('Property ID is required', { status: 400 })
	}

	try {
		if (request.method === 'DELETE') {
			await APIClient.delete(APIRoute.property(propertyID))
			return redirect(Route.viewProperties)
		} else if (request.method === 'PUT') {
			const body = await request.json()
			await APIClient.put(APIRoute.properties, { body })
			return redirect(Route.viewProperty(propertyID))
		} else {
			throw new Error('Invalid request method')
		}
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), { status: 400 })
	}
}

export default function EditProperty() {
	const { property } =
		useOutletContext<PropertyConfigurationDetailsOutletContext>()
	const actionData = useActionData<ErrorResponse>()
	const submit = useSubmit()

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this property?')) {
			submit(null, { method: 'DELETE' })
		}
	}

	const handleSubmit = (data: PropertyFormData) => {
		const updateData = {
			propertyConfigurationID: property.propertyConfigurationID,
			...data,
		}
		submit(updateData, { method: 'PUT', encType: 'application/json' })
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					Edit Property
				</h2>
			</div>

			<PropertyForm
				defaultValues={property}
				onSubmit={handleSubmit}
				error={actionData?.message}
				submitLabel="Save Changes"
				mode={PropertyFormMode.edit}
				onDelete={handleDelete}
			/>
		</div>
	)
}
