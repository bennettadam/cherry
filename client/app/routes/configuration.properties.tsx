import { LoaderFunctionArgs } from '@remix-run/node'
import { APIRoute } from '~/utility/Routes'
import {
	PropertyConfigurationOutletContext,
	PropertyConfigurationResponse,
} from '~/models/types'
import { Outlet, useLoaderData } from '@remix-run/react'

export async function loader({}: LoaderFunctionArgs) {
	const response = await fetch(APIRoute.properties, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error('Failed to fetch properties')
	}

	return (await response.json()) as PropertyConfigurationResponse
}

export default function ConfigurationProperties() {
	const { data } = useLoaderData<typeof loader>()

	const outletContext: PropertyConfigurationOutletContext = {
		properties: data,
	}

	return <Outlet context={outletContext} />
}
