import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, Brain, ChevronRight } from 'lucide-react'

interface RoleCardProps {
  icon: React.ReactNode
  iconBgColor: string
  title: string
  description: string
  to: string
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, iconBgColor, title, description, to }) => {
  return (
    <Link 
      to={to}
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
    >
      <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-montserrat font-semibold text-heading">{title}</h3>
        <p className="text-sm text-label">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  )
}

const LandingPage: React.FC = () => {
  const roles = [
    {
      icon: <GraduationCap className="w-7 h-7 text-[#5f269e]" />,
      iconBgColor: 'bg-purple-50',
      title: 'I am a Student',
      description: 'Track your progress',
      to: '/login/student'
    },
    {
      icon: <Users className="w-7 h-7 text-teal-600" />,
      iconBgColor: 'bg-teal-50',
      title: 'I am a Parent',
      description: "View your child's insights",
      to: '/login/parent'
    },
    {
      icon: <BookOpen className="w-7 h-7 text-rose-500" />,
      iconBgColor: 'bg-rose-50',
      title: 'I am a Teacher',
      description: 'Monitor class wellbeing',
      to: '/login/teacher'
    },
    {
      icon: <Brain className="w-7 h-7 text-amber-500" />,
      iconBgColor: 'bg-amber-50',
      title: 'I am a Psychologist',
      description: 'Provide expert mental health support',
      to: '/login/psychologist'
    }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle purple radial glow behind left content */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] -translate-x-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 30% 50%, rgba(95, 38, 158, 0.06) 0%, transparent 70%)',
        }}
      />
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-12">
            <img
              src="/logo.png"
              alt="SageFlow"
              className="w-16 h-16 object-contain"
            />
            <span className="text-2xl md:text-3xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>

          {/* Tagline - multi-line, second half in purple */}
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-heading leading-tight max-w-md mx-auto lg:mx-0">
            <span className="block">Empowering</span>
            <span className="block">students to build</span>
            <span className="block">
              <span className="font-bold text-[#5f269e]">healthy habits</span>
              <span className="font-bold text-heading"> and</span>
            </span>
            <span className="block font-bold text-[#5f269e]">mental wellness.</span>
          </h2>
        </div>

        {/* Right Side - Role Selection */}
        <div className="flex-1 w-full max-w-md">
          {/* Header */}
          <p className="text-sm font-semibold text-label tracking-wider mb-6 text-center lg:text-left">
            SELECT YOUR ROLE TO CONTINUE
          </p>

          {/* Role Cards */}
          <div className="flex flex-col gap-4">
            {roles.map((role, index) => (
              <RoleCard
                key={index}
                icon={role.icon}
                iconBgColor={role.iconBgColor}
                title={role.title}
                description={role.description}
                to={role.to}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default LandingPage
