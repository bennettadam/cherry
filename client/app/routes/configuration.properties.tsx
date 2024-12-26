import { LoaderFunctionArgs } from '@remix-run/node'
import { APIRoute } from '~/utility/Routes'
import {
	PropertyConfigurationOutletContext,
	PropertyConfigurationResponse,
} from '~/models/types'
import { Outlet, useLoaderData } from '@remix-run/react'
import { APIClient } from '~/utility/APIClient'

export async function loader({}: LoaderFunctionArgs) {
	return APIClient.get<PropertyConfigurationResponse>(APIRoute.properties)
}

export default function ConfigurationProperties() {
	const { data } = useLoaderData<typeof loader>()

	const outletContext: PropertyConfigurationOutletContext = {
		properties: data,
	}

	return <Outlet context={outletContext} />
}
