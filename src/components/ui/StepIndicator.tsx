import React from 'react'

interface Step {
  number: number
  title: string
  completed: boolean
  current?: boolean
}

interface StepIndicatorProps {
  steps: Step[]
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  return (
    <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
      <nav aria-label="Progress" className="flex justify-center">
        <ol className="flex items-center space-x-8 lg:space-x-16">
          {steps.map((step, stepIdx) => (
            <li key={step.number} className="relative flex flex-col items-center">
              {/* Connector line */}
              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-5 left-12 w-8 lg:w-16 h-0.5 z-0">
                  <div className={`h-full transition-all duration-500 ${
                    step.completed ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'
                  }`} />
                </div>
              )}
              
              {/* Step circle */}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center mb-3">
                {step.completed ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transform transition-all duration-300 hover:scale-110">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : step.current ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg ring-4 ring-blue-100 transform transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-semibold text-white">{step.number}</span>
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-sm transform transition-all duration-300 hover:scale-105">
                    <span className="text-sm font-medium text-gray-500">{step.number}</span>
                  </div>
                )}
              </div>
              
              {/* Step title */}
              <div className="text-center">
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  step.completed 
                    ? 'text-blue-600' 
                    : step.current 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-500'
                } whitespace-nowrap`}>
                  {step.title}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

export default StepIndicator
