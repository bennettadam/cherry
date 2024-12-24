import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Link } from '@remix-run/react'
import {
	PropertyConfiguration,
	PropertyConfigurationResponse,
} from '~/models/types'
import { APIRoute } from '~/utility/Routes'
import { Table, type Column } from '~/components/Table'
import { useNavigate } from '@remix-run/react'
import { Tools } from '~/utility/Tools'

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
	const navigate = useNavigate()

	const columns: Column<PropertyConfiguration>[] = [
		{
			header: 'Title',
			key: 'title',
			render: (property) => property.title,
		},
		{
			header: 'Type',
			key: 'propertyType',
			render: (property) =>
				Tools.capitalizeFirstLetter(property.propertyType),
		},
		{
			header: 'Default Value',
			key: 'defaultValue',
			render: (property) => (
				<span className="text-gray-500">
					{property.defaultValue || '-'}
				</span>
			),
		},
		{
			header: 'Source',
			key: 'source',
			render: (property) => Tools.capitalizeFirstLetter(property.source),
		},
	]

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">Properties</h2>
				<Link
					to="new"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					New Property
				</Link>
			</div>

			<Table
				data={data}
				columns={columns}
				onRowClick={(property) =>
					navigate(`${property.propertyConfigurationID}/edit`)
				}
			/>
		</div>
	)
}
