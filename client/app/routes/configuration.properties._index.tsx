import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Link } from '@remix-run/react'
import {
	PropertyConfiguration,
	PropertyConfigurationResponse,
} from '../models/types'
import { APIRoute } from '../utility/Routes'

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

	function renderEnumOptions(propertyConfiguration: PropertyConfiguration) {
		const options = propertyConfiguration.enumOptions ?? []
		return options.length > 0
			? propertyConfiguration.enumOptions?.join(', ')
			: '-'
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">Properties</h2>
				<Link
					to="new"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					New Property
				</Link>
			</div>

			<div className="overflow-hidden rounded-lg border border-gray-200">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>
								Name
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>
								Type
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>
								Default Value
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>
								Options
							</th>
							<th scope="col" className="relative px-6 py-3">
								<span className="sr-only">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
						{data.map((property) => (
							<tr key={property.propertyConfigurationID}>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-sm font-medium text-gray-900">
										{property.name}
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-sm text-gray-900">
										{property.propertyType}
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-sm text-gray-900">
										{property.defaultValue || '-'}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-500">
										{renderEnumOptions(property)}
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
									<Link
										to={`${property.propertyConfigurationID}/edit`}
										className="text-sky-600 hover:text-sky-900"
									>
										Edit
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
