import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	Link,
	useOutletContext,
	useParams,
} from '@remix-run/react'
import { PropertyConfigurationDetailsOutletContext } from '~/models/types'
import { Tools } from '~/utility/Tools'
import { BackButton } from '~/components/BackButton'
import { DateDisplay } from '~/components/DateDisplay'

export default function PropertyDetailsIndex() {
	const { property } =
		useOutletContext<PropertyConfigurationDetailsOutletContext>()

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<BackButton />
				<Link
					to="edit"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					Edit Property
				</Link>
			</div>

			<div>
				<h2 className="text-2xl font-semibold text-gray-900 mb-6">
					{property.title}
				</h2>

				<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<dt className="text-sm font-medium text-gray-500">
							Property Type
						</dt>
						<dd className="mt-1 text-sm text-gray-900">
							{Tools.propertyTypeToDisplayText(property.propertyType)}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-gray-500">Source</dt>
						<dd className="mt-1 text-sm text-gray-900">
							{Tools.capitalizeFirstLetter(property.source)}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-gray-500">
							Required
						</dt>
						<dd className="mt-1 text-sm text-gray-900">
							{property.isRequired ? 'Yes' : 'No'}
						</dd>
					</div>

					<div>
						<dt className="text-sm font-medium text-gray-500">
							Default Value
						</dt>
						<dd className="mt-1 text-sm text-gray-900">
							{property.defaultValue || '-'}
						</dd>
					</div>

					{property.selectOptions && (
						<div className="sm:col-span-2">
							<dt className="text-sm font-medium text-gray-500">
								Select Options
							</dt>
							<dd className="mt-1 text-sm text-gray-900">
								{property.selectOptions.join(', ')}
							</dd>
						</div>
					)}

					<div className="sm:col-span-2">
						<dt className="text-sm font-medium text-gray-500">Created</dt>
						<dd className="mt-1 text-sm text-gray-900">
							<DateDisplay date={property.creationDate} />
						</dd>
					</div>
				</dl>
			</div>
		</div>
	)
}
