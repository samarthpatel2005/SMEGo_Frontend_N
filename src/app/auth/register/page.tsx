import RegisterForm from '@/components/forms/RegisterForm'

interface RegisterPageProps {
  searchParams: Promise<{
    invite?: string
    mode?: 'create' | 'join' | 'client'
  }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Vector Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Left Vector */}
        <div className="absolute -top-20 -left-20 w-64 h-64 opacity-5 animate-float">
          <svg viewBox="0 0 200 200" className="w-full h-full text-blue-600">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Top Right Vector */}
        <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 animate-pulse-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full text-indigo-500">
            <polygon points="100,20 180,180 20,180" fill="currentColor" />
            <polygon points="100,40 160,160 40,160" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Bottom Left Vector */}
        <div className="absolute -bottom-16 -left-16 w-56 h-56 opacity-8 animate-float-delayed">
          <svg viewBox="0 0 200 200" className="w-full h-full text-purple-400">
            <rect x="50" y="50" width="100" height="100" fill="currentColor" rx="20" />
            <rect x="70" y="70" width="60" height="60" fill="none" stroke="white" strokeWidth="2" rx="10" />
          </svg>
        </div>

        {/* Bottom Right Vector */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 opacity-6 animate-rotate-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full text-blue-400">
            <path d="M20,100 Q100,20 180,100 Q100,180 20,100 Z" fill="currentColor" />
            <path d="M40,100 Q100,40 160,100 Q100,160 40,100 Z" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Center Decorative Elements */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 opacity-20 animate-pulse-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
            <circle cx="50" cy="50" r="20" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 opacity-15 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-300">
            <rect x="25" y="25" width="50" height="50" fill="currentColor" rx="5" />
          </svg>
        </div>

        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-12 w-8 h-8 opacity-10 animate-float-delayed">
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-300">
            <circle cx="50" cy="50" r="30" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute top-1/3 right-12 w-10 h-10 opacity-15 animate-pulse-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-200">
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <RegisterForm 
            inviteToken={params.invite}
            mode={params.mode}
          />
        </div>
      </div>
    </div>
  )
}
