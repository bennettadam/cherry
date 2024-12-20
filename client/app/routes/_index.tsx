import { json, type ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit, Link, useFetcher } from '@remix-run/react'
import { useState } from 'react'
import ProjectModal from '~/components/ProjectModal'
import type { FetchResponse } from '~/models/types'
import { APIRoute, Route } from '~/utility/Routes'
import { NewProject, Project } from '~/models/project'

export async function action({ request }: ActionFunctionArgs) {
	try {
		const response = await fetch(APIRoute.projects, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: await request.text(),
		})

		if (!response.ok) {
			throw new Error('Failed to create property')
		}

		return Response.json({ success: true })
	} catch (error) {
		return Response.json(
			{ error: 'Failed to create property' },
			{ status: 400 }
		)
	}
}

export async function loader() {
	const response = await fetch(APIRoute.projects, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch properties', { status: 500 })
	}

	return (await response.json()) as FetchResponse<Project[]>
}

export default function Projects() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { data } = useLoaderData<typeof loader>()
	const fetcher = useFetcher()

	const handleCreateProject = (newProject: NewProject) => {
		fetcher.submit(newProject, {
			method: 'POST',
			encType: 'application/json',
		})
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
						className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
					>
						New Project
					</button>
				</div>
				<div className="rounded-lg border border-gray-200">
					{data.length === 0 ? (
						<div className="p-4 text-sm text-gray-500">
							No projects created yet.
						</div>
					) : (
						<ul className="divide-y divide-gray-200">
							{data.map((project) => (
								<li key={project.projectID}>
									<Link
										to={Route.viewTests(project.projectID)}
										className="block p-4 transition-colors hover:bg-gray-50"
									>
										<div className="flex justify-between">
											<div>
												<div className="flex items-center gap-2">
													<h3 className="text-sm font-medium text-gray-900">
														{project.name}
													</h3>
													<span className="text-xs text-gray-500">
														{project.projectShortCode}
													</span>
												</div>
												<p className="mt-1 text-sm text-gray-500 line-clamp-2">
													{project.description}
												</p>
											</div>
											<div className="text-xs text-gray-500">
												{new Date(
													project.creationDate
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
