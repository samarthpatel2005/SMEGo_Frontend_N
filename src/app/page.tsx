"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, BarChart3, FileText, Users, DollarSign, Building2, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';


const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SMEGo</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contact</a>
          </div>
          <div className="flex space-x-3">
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const BackgroundVectors: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute top-20 left-10 w-32 h-32 text-blue-100 opacity-60" fill="currentColor" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" />
    </svg>
    <svg className="absolute top-40 right-20 w-24 h-24 text-purple-100 opacity-40" fill="currentColor" viewBox="0 0 100 100">
      <rect x="25" y="25" width="50" height="50" rx="8" />
    </svg>
    <svg className="absolute bottom-40 left-20 w-28 h-28 text-indigo-100 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 100">
      <polygon points="50,10 90,80 10,80" />
    </svg>
    <svg className="absolute bottom-20 right-10 w-36 h-36 text-blue-50 opacity-30" fill="currentColor" viewBox="0 0 100 100">
      <path d="M50,10 L60,40 L90,40 L68,60 L78,90 L50,75 L22,90 L32,60 L10,40 L40,40 Z" />
    </svg>
    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
    <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-200 rounded-full animate-pulse delay-1000"></div>
    <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-indigo-200 rounded-full animate-pulse delay-2000"></div>
  </div>
);

const FloatingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Revenue', 'Clients', 'Invoices', 'Reports'];
  const data = [
    { title: 'Monthly Revenue', value: '$45,231', color: 'from-blue-500 to-blue-600', icon: DollarSign },
    { title: 'Active Clients', value: '125', color: 'from-green-500 to-green-600', icon: Users },
    { title: 'Pending Invoices', value: '23', color: 'from-purple-500 to-purple-600', icon: FileText },
    { title: 'Growth Rate', value: '+18%', color: 'from-orange-500 to-orange-600', icon: BarChart3 }
  ];

  return (
    <div className="floating-dashboard bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md animate-float border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600">Live Demo</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === index 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={item.title}
            className={`p-4 rounded-xl bg-gradient-to-r ${item.color} text-white transform transition-all duration-300 ${
              activeTab === index ? 'scale-105 shadow-lg' : 'scale-100 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{item.title}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <item.icon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}> = ({ icon: Icon, title, description, color, delay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`feature-card p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fadeInUp`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`inline-flex items-center justify-center p-4 bg-gradient-to-br ${color} rounded-xl shadow-lg mb-6 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      <div className={`mt-4 flex items-center text-blue-600 font-medium transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`}>
        Learn more <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive business insights with AI-powered analytics, real-time dashboards, and customizable reports that help you make data-driven decisions.',
      color: 'from-blue-500 to-blue-600',
      delay: 100
    },
    {
      icon: FileText,
      title: 'Smart Invoicing',
      description: 'Create, send, and track professional invoices with automated payment reminders, multiple payment options, and seamless integration with accounting systems.',
      color: 'from-green-500 to-green-600',
      delay: 200
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Streamline employee management with advanced HR tools, performance tracking, and collaborative workspaces that boost team productivity.',
      color: 'from-purple-500 to-purple-600',
      delay: 300
    },
    {
      icon: DollarSign,
      title: 'Payroll Processing',
      description: 'Automated payroll processing with intelligent tax calculations, compliance management, and direct deposit capabilities for hassle-free payments.',
      color: 'from-yellow-500 to-yellow-600',
      delay: 400
    },
    {
      icon: Building2,
      title: 'Client Portal',
      description: 'Dedicated client portal with secure access to invoices, project updates, payment history, and real-time communication tools.',
      color: 'from-red-500 to-red-600',
      delay: 500
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption, multi-factor authentication, and compliance with international data protection standards.',
      color: 'from-indigo-500 to-indigo-600',
      delay: 600
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content: 'SMEGo transformed our business processes. We reduced administrative time by 60% and improved client satisfaction significantly.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Founder, Creative Solutions',
      content: 'The analytics dashboard gives us incredible insights. We can now make informed decisions and track our growth in real-time.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Manager, GrowthCo',
      content: 'Best investment we made for our company. The automation features save us hours every week and the support team is outstanding.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <BackgroundVectors />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-pulse">
                  🚀 Now with AI-powered insights
                </span>
              </div>
              
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl md:text-7xl animate-fadeInUp">
                Streamline Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Business Operations
                </span>
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 leading-relaxed animate-fadeInUp delay-200">
                Complete SME management platform with intelligent automation for invoicing, payroll, client management, and analytics. 
                Everything you need to scale your business efficiently.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeInUp delay-400">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Start Free Trial
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 bg-white hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Watch Demo
                  <BarChart3 className="ml-2 w-5 h-5" />
                </Link>
              </div>

              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500 animate-fadeInUp delay-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center lg:justify-end">
              <FloatingDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute top-10 left-10 w-40 h-40 text-blue-50" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50,5 L95,25 L95,75 L50,95 L5,75 L5,25 Z" opacity="0.3" />
          </svg>
          <svg className="absolute bottom-10 right-10 w-32 h-32 text-purple-50" fill="currentColor" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" opacity="0.4" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">
              Powerful Features
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Everything you need to manage your business
            </h3>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Powerful tools designed specifically for small and medium enterprises, 
              with intelligent automation and enterprise-grade security.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute top-20 left-20 w-64 h-64 text-white opacity-5" fill="currentColor" viewBox="0 0 100 100">
            <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Trusted by growing businesses
            </h2>
            <p className="text-xl text-blue-100">
              See what our customers are saying about SMEGo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 text-lg leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-blue-200">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
            <path d="M0,400 Q300,300 600,350 T1200,300 L1200,400 Z" fill="rgba(255,255,255,0.05)" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center py-24 px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of businesses already using SMEGo to streamline their workflows and accelerate growth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Start Free Trial
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="/plans" className="text-base text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#features" className="text-base text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SMEGo</span>
              </div>
              <p className="text-base text-gray-400">
                ©️ 2025 SMEGo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-400 {
          animation-delay: 400ms;
        }
        
        .delay-600 {
          animation-delay: 600ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default Home;