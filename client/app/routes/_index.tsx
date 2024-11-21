import { json, type ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit, Link } from '@remix-run/react'
import { useState } from 'react'
import ProjectModal from '~/components/ProjectModal'
import type { Project } from '~/models/types'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const name = formData.get('name') as string
	const description = formData.get('description') as string

	const newProject: Project = {
		projectID: crypto.randomUUID(),
		name,
		description,
		createdAt: new Date().toISOString(),
	}

	return Response.json({ success: true })
}

export async function loader() {
	return { projects: [] }
}

export default function Projects() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { projects } = useLoaderData<typeof loader>()
	const submit = useSubmit()

	const handleCreateProject = (data: {
		name: string
		description: string
	}) => {
		const formData = new FormData()
		formData.append('name', data.name)
		formData.append('description', data.description)

		submit(formData, { method: 'POST' })
		setIsModalOpen(false)
	}

	return (
		<main className="flex-1 overflow-auto">
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-gray-900">
						Projects
					</h2>
					<button
						onClick={() => setIsModalOpen(true)}
						className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						New Project
					</button>
				</div>
				<div className="rounded-lg border border-gray-200">
					{projects.length === 0 ? (
						<div className="p-4 text-sm text-gray-500">
							No projects created yet.
						</div>
					) : (
						<ul className="divide-y divide-gray-200">
							{projects.map((project) => (
								<li key={project.projectID}>
									<Link
										to={`${project.projectID}`}
										className="block p-4 transition-colors hover:bg-gray-50"
									>
										<div className="flex justify-between">
											<div>
												<h3 className="text-sm font-medium text-gray-900">
													{project.name}
												</h3>
												<p className="mt-1 text-sm text-gray-500 line-clamp-2">
													{project.description}
												</p>
											</div>
											<div className="text-xs text-gray-500">
												{new Date(
													project.createdAt
												).toLocaleDateString()}
											</div>
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>

				<ProjectModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleCreateProject}
				/>
			</div>
		</main>
	)
}
