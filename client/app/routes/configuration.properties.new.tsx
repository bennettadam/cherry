import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import { projectStore } from '~/models/project.server'
import type { PropertyType } from '~/models/types'
import { Route } from '../utility/Route'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const newProperty = {
		id: crypto.randomUUID(),
		name: formData.get('name') as string,
		propertyType: formData.get('propertyType') as PropertyType,
		propertyOptions: formData.get('propertyOptions')
			? (formData.get('propertyOptions') as string)
					.split(',')
					.map((opt) => opt.trim())
			: [],
		defaultValue: (formData.get('defaultValue') as string) || undefined,
		createdAt: new Date().toISOString(),
	}

	await projectStore.addPropertyConfiguration(newProperty)
	return redirect(Route.viewProperties)
}

export default function NewProperty() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Property
				</h2>
			</div>

			<Form method="post" className="space-y-6 max-w-2xl">
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-700"
					>
						Name
					</label>
					<input
						type="text"
						name="name"
						id="name"
						required
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="propertyType"
						className="block text-sm font-medium text-gray-700"
					>
						Type
					</label>
					<select
						name="propertyType"
						id="propertyType"
						required
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					>
						<option value="text">Text</option>
						<option value="number">Number</option>
						<option value="enum">Enum</option>
					</select>
				</div>

				<div>
					<label
						htmlFor="propertyOptions"
						className="block text-sm font-medium text-gray-700"
					>
						Options (comma-separated, for enum type)
					</label>
					<input
						type="text"
						name="propertyOptions"
						id="propertyOptions"
						placeholder="Option1, Option2, Option3"
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
					<p className="mt-1 text-sm text-gray-500">
						Only required for enum type. Separate options with commas.
					</p>
				</div>

				<div>
					<label
						htmlFor="defaultValue"
						className="block text-sm font-medium text-gray-700"
					>
						Default Value
					</label>
					<input
						type="text"
						name="defaultValue"
						id="defaultValue"
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				</div>

				<div className="flex justify-end gap-4">
					<Link
						to={Route.viewProperties}
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Link>
					<button
						type="submit"
						className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Create Property
					</button>
				</div>
			</Form>
		</div>
	)
}
