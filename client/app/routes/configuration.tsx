import { Outlet } from '@remix-run/react'
import Sidebar from '~/components/Sidebar'

export default function ConfigurationLayout() {
	return (
		<div className="flex">
			<Sidebar
				title="Configuration"
				items={[{ to: '/configuration/properties', label: 'Properties' }]}
			/>
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	)
}
