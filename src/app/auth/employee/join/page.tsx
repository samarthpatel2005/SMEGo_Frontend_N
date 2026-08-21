
import EmployeeJoinForm from '@/components/forms/registration/EmployeeJoinForm'
import { useState } from 'react'

export default function EmployeeJoinPage() {
	const [loading, setLoading] = useState(false)

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
			<div className="w-full max-w-lg">
				<h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Join Organization as Employee</h1>
				<EmployeeJoinForm
					onSubmit={async () => {}}
					onBack={() => window.location.href = '/auth/login'}
					isLoading={loading}
				/>
			</div>
		</div>
	)
}
