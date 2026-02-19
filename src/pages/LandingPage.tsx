import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, Brain, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface RoleCardProps {
  icon: React.ReactNode
  iconBgGradient: string
  iconColor: string
  title: string
  description: string
  to: string
  index: number
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, iconBgGradient, iconColor, title, description, to, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        className="flex items-center gap-4 glass-card p-6 group relative overflow-hidden"
      >
        {/* Animated gradient background on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-purple opacity-0 group-hover:opacity-5 transition-opacity duration-500"
          initial={false}
        />

        <motion.div
          className={`relative w-16 h-16 ${iconBgGradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={iconColor}>
            {icon}
          </div>
        </motion.div>

        <div className="flex-1 relative z-10">
          <motion.h3
            className="text-lg font-montserrat font-semibold text-heading mb-1"
            initial={false}
          >
            {title}
          </motion.h3>
          <p className="text-sm text-body">{description}</p>
        </div>

        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center shadow-glow relative z-10"
          whileHover={{ scale: 1.2, rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </motion.div>
      </Link>
    </motion.div>
  )
}

const LandingPage: React.FC = () => {
  const roles = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      iconBgGradient: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconColor: 'text-white',
      title: 'I am a Student',
      description: 'Track your progress',
      to: '/login/student'
    },
    {
      icon: <Users className="w-8 h-8" />,
      iconBgGradient: 'bg-gradient-to-br from-teal-500 to-emerald-600',
      iconColor: 'text-white',
      title: 'I am a Parent',
      description: "View your child's insights",
      to: '/login/parent'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      iconBgGradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
      iconColor: 'text-white',
      title: 'I am a Teacher',
      description: 'Monitor class wellbeing',
      to: '/login/teacher'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      iconBgGradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      iconColor: 'text-white',
      title: 'I am a Psychologist',
      description: 'Provide expert mental health support',
      to: '/login/psychologist'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-violet-500 blur-[120px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-pink-400 to-purple-500 blur-[130px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-400 to-purple-400 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left"
        >
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-12">
            <motion.div
              whileHover={{ rotateY: 360, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="p-1 relative"
              style={{ transformPerspective: 600 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                    "0 0 40px rgba(139, 92, 246, 0.5)",
                    "0 0 20px rgba(139, 92, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-full"
              >
                <img
                  src="/logo.png"
                  alt="SageFlow"
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
              </motion.div>
            </motion.div>
            <motion.span
              className="text-3xl md:text-4xl font-montserrat font-bold text-heading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              SageFlow
            </motion.span>
          </div>

          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-bold leading-tight max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="block text-heading">Empowering</span>
            <span className="block text-heading">students to build</span>
            <span className="block">
              <span className="bg-gradient-purple bg-clip-text text-transparent font-bold">healthy habits</span>
              <span className="text-heading font-bold"> and</span>
            </span>
            <span className="block bg-gradient-purple bg-clip-text text-transparent font-bold">mental wellness.</span>
          </motion.h2>

          <motion.p
            className="mt-6 text-lg text-body max-w-md mx-auto lg:mx-0 leading-relaxed font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            AI Powered Student Mental Health Solution.
          </motion.p>
        </motion.div>

        {/* Right Side - Role Selection */}
        <div className="flex-1 w-full max-w-md">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-semibold text-primary tracking-wider mb-6 text-center lg:text-left uppercase flex items-center justify-center lg:justify-start gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-primary rounded-full"
            />
            IDENTIFY YOURSELF
          </motion.p>

          <div className="flex flex-col gap-4">
            {roles.map((role, index) => (
              <RoleCard
                key={index}
                index={index}
                icon={role.icon}
                iconBgGradient={role.iconBgGradient}
                iconColor={role.iconColor}
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
