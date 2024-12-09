import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import { useLoaderData, useActionData, useSubmit } from '@remix-run/react'
import type { PropertyFormData } from '~/components/PropertyForm'
import PropertyForm from '~/components/PropertyForm'
import { APIRoute, Route } from '~/utility/Routes'
import { PropertyConfigurationResponse } from '../models/types'

export async function loader({ params }: LoaderFunctionArgs) {
	const propertyID = params.propertyID
	if (!propertyID) {
		throw new Response('Property ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.properties, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch properties', { status: 500 })
	}

	const { data } = (await response.json()) as PropertyConfigurationResponse
	const property = data.find((p) => p.propertyConfigurationID === propertyID)

	if (!property) {
		throw new Response('Property not found', { status: 404 })
	}

	return { property }
}

export async function action({ request, params }: ActionFunctionArgs) {
	const propertyID = params.propertyID
	if (!propertyID) {
		throw new Response('Property ID is required', { status: 400 })
	}

	if (request.method === 'DELETE') {
		try {
			const response = await fetch(APIRoute.property(propertyID), {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				throw new Error('Failed to delete property')
			}

			return redirect(Route.viewProperties)
		} catch (error) {
			return Response.json(
				{ error: 'Failed to delete property' },
				{ status: 400 }
			)
		}
	} else {
		try {
			const response = await fetch(APIRoute.properties, {
				method: 'PUT',
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
				{ error: 'Failed to edit property' },
				{ status: 400 }
			)
		}
	}
}

export default function EditProperty() {
	const { property } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const submit = useSubmit()

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this property?')) {
			submit(null, { method: 'delete' })
		}
	}

	const handleSubmit = (data: PropertyFormData) => {
		const updateData = {
			propertyConfigurationID: property.propertyConfigurationID,
			...data,
		}
		submit(updateData, { method: 'post', encType: 'application/json' })
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					Edit Property
				</h2>
			</div>

			<PropertyForm
				defaultValues={property}
				onSubmit={handleSubmit}
				error={actionData?.error}
				submitLabel="Save Changes"
				allowTypeEdit={false}
				onDelete={handleDelete}
			/>
		</div>
	)
}
