'use client'

import Button from '@/components/ui/Button'
import { RegistrationPath } from '@/types/registration'
import React from 'react'

interface RegistrationPathSelectorProps {
  onSelectPath: (path: RegistrationPath) => void
}

const RegistrationPathSelector: React.FC<RegistrationPathSelectorProps> = ({ onSelectPath }) => {
  const paths = [
    {
      id: 'create' as RegistrationPath,
      title: 'Create Organization',
      subtitle: 'For Business Owners & Administrators',
      description: 'Set up your organization, configure business processes, and manage your entire operation from a centralized platform.',
      features: ['Complete admin control', 'User management', 'Custom workflows', 'Analytics dashboard'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM7.5 6v12M16.5 6v12" />
        </svg>
      ),
      gradient: 'from-blue-600 to-blue-700',
      bgGradient: 'from-blue-50 to-indigo-50',
      recommended: true
    },
    {
      id: 'join' as RegistrationPath,
      title: 'Join Organization',
      subtitle: 'For Employees & Team Members',
      description: 'Access your organization\'s workspace with an invitation code or email. Collaborate with your team and manage daily tasks.',
      features: ['Team collaboration', 'Task management', 'Role-based access', 'Mobile support'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      gradient: 'from-emerald-600 to-emerald-700',
      bgGradient: 'from-emerald-50 to-teal-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Welcome to <span className="text-blue-600">SMEGo</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The comprehensive business management platform designed specifically for small and medium enterprises. 
            Choose your path to get started.
          </p>
        </div>

        {/* Registration Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {paths.map((path) => (
              <div
                key={path.id}
                className="relative bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                onClick={() => onSelectPath(path.id)}
              >
                {/* Recommended Badge */}
                {path.recommended && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Recommended
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-8">
                  {/* Icon and Title Section */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${path.bgGradient} flex items-center justify-center text-slate-700 shadow-sm`}>
                      {path.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{path.title}</h3>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{path.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 leading-relaxed">{path.description}</p>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Key Features</h4>
                    <div className="space-y-2">
                      {path.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${path.gradient}`}></div>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full py-4 text-base font-semibold bg-gradient-to-r ${path.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectPath(path.id)
                    }}
                  >
                    {path.id === 'create' ? 'Create Organization' : 'Join Organization'}
                    <svg className="w-4 h-4 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-slate-200/50">
            <p className="text-slate-600 mb-2">
              Already have an account?
            </p>
            <a 
              href="/auth/login" 
              className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-300 text-lg"
            >
              Sign in to your account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure & Compliant
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Lightning Fast Setup
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-5.385-4.365-9.75-9.75-9.75z" />
              </svg>
              24/7 Support Available
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPathSelector