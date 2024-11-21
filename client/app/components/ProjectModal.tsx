import { useEffect, useRef } from 'react'
import { useFetcher } from '@remix-run/react'
import { NewProject } from '../models/project'

interface ProjectModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (newProject: NewProject) => void
}

export default function ProjectModal({
	isOpen,
	onClose,
	onSubmit,
}: ProjectModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const fetcher = useFetcher()

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (isOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}
	}, [isOpen])

	return (
		<dialog
			ref={dialogRef}
			className="rounded-lg p-0 backdrop:bg-gray-500/50"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) {
					onClose()
				}
			}}
		>
			<div className="min-w-[500px] p-6">
				<h2 className="text-lg font-medium text-gray-900">
					Create New Project
				</h2>
				<fetcher.Form
					method="post"
					className="mt-4"
					onSubmit={(event) => {
						event.preventDefault()
						const formData = new FormData(event.currentTarget)
						onSubmit({
							name: formData.get('name') as string,
							projectShortCode: formData.get('shortCode') as string,
							description: formData.get('description') as
								| string
								| undefined,
						})
					}}
				>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Project Name
							</label>
							<input
								type="text"
								name="name"
								id="name"
								required
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label
								htmlFor="shortCode"
								className="block text-sm font-medium text-gray-700"
							>
								Project Short Code
							</label>
							<input
								type="text"
								name="shortCode"
								id="shortCode"
								required
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700"
							>
								Description
							</label>
							<textarea
								name="description"
								id="description"
								rows={3}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
						>
							Create
						</button>
					</div>
				</fetcher.Form>
			</div>
		</dialog>
	)
}
