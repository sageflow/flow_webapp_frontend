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
      icon: <GraduationCap className="w-7 h-7 text-primary" />,
      iconBgColor: 'bg-blue-50',
      title: 'I am a Student',
      description: 'Track your mood & progress',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border-2 border-accent/30">
              <div className="w-6 h-6 border-2 border-accent rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
            <span className="text-2xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[52px] font-montserrat font-bold text-heading leading-tight mb-6">
            Growth starts<br />with reflection.
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-body max-w-md mx-auto lg:mx-0">
            Empowering students to build healthy habits and mental wellness.
          </p>
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

          {/* Sign In Link */}
          <p className="text-center text-sm text-body mt-8">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
