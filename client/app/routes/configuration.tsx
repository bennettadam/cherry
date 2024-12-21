import { Outlet } from '@remix-run/react'
import ProjectSidebar from '~/components/Sidebar'

export default function ConfigurationLayout() {
	return (
		<div className="flex">
			<ProjectSidebar
				title="Configuration"
				items={[{ to: '/configuration/properties', label: 'Properties' }]}
			/>
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	)
}
