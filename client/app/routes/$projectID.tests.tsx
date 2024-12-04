import { Link, Outlet } from '@remix-run/react'

export default function TestCasesLayout() {
	return (
		<div className="p-6">
			<Outlet />
		</div>
	)
}
