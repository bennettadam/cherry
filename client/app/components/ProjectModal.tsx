import { useEffect, useRef } from 'react'
import { useFetcher } from '@remix-run/react'
import { NewProject } from '../models/project'

interface ProjectModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (newProject: NewProject) => void
	error?: string
}

export default function ProjectModal({
	isOpen,
	onClose,
	onSubmit,
	error,
}: ProjectModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const formRef = useRef<HTMLFormElement>(null)

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

	function handleClose() {
		formRef.current?.reset()
		onClose()
	}

	return (
		<dialog
			ref={dialogRef}
			className="rounded-lg p-0 backdrop:bg-gray-500/50"
			onClose={handleClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) {
					handleClose()
				}
			}}
		>
			<div className="min-w-[500px] p-6">
				<h2 className="text-lg font-medium text-gray-900">
					Create New Project
				</h2>
				{error && (
					<div className="mt-4 rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}
				<fetcher.Form
					method="post"
					className="mt-4"
					ref={formRef}
					onSubmit={(event) => {
						event.preventDefault()
						const formData = new FormData(event.currentTarget)
						onSubmit({
							title: formData.get('title') as string,
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
								htmlFor="title"
								className="block text-sm font-medium text-gray-700"
							>
								Project Name
							</label>
							<input
								type="text"
								name="title"
								id="title"
								required
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								onInput={(e) => {
									const input = e.currentTarget
									input.value = input.value.toUpperCase()
								}}
								onKeyDown={(e) => {
									if (!/[A-Z0-9]/.test(e.key.toUpperCase())) {
										e.preventDefault()
									}
								}}
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
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={handleClose}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
						>
							Create
						</button>
					</div>
				</fetcher.Form>
			</div>
		</dialog>
	)
}
