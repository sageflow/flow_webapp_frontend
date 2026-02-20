import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuthNavbarProps {
    /** Where the Back button navigates to. Defaults to "/". */
    backTo?: string
    /** Label shown in the Back button. Defaults to "Back". */
    backLabel?: string
}

/**
 * AuthNavbar
 *
 * Renders the top navigation bar used on all auth pages:
 *   – Back button on the LEFT (frosted-glass style)
 *   – SageFlow logo + brand name on the RIGHT (coin-flip hover)
 *
 * Usage:
 *   <AuthNavbar />
 *   <AuthNavbar backTo="/login/student" backLabel="Back to Login" />
 */
const AuthNavbar: React.FC<AuthNavbarProps> = ({
    backTo = '/',
    backLabel = 'Back',
}) => (
    <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        {/* Back Button — left */}
        <Link
            to={backTo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#5f269e] bg-white/60 backdrop-blur-md hover:bg-white/85 border border-white/50 hover:border-purple-200 shadow-soft transition-all duration-200 text-sm font-semibold font-jakarta"
        >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
        </Link>

        {/* SageFlow Logo + Brand — right */}
        <Link to="/" className="flex items-center gap-3 group">
            <motion.div
                whileHover={{ rotateY: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{ transformPerspective: 600 }}
            >
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 16px rgba(139, 92, 246, 0.25)',
                            '0 0 32px rgba(139, 92, 246, 0.45)',
                            '0 0 16px rgba(139, 92, 246, 0.25)',
                        ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="rounded-full"
                >
                    <img
                        src="/logo.png"
                        alt="SageFlow"
                        className="w-10 h-10 object-contain drop-shadow-md"
                    />
                </motion.div>
            </motion.div>
            <span className="text-xl font-montserrat font-bold text-heading group-hover:text-primary transition-colors duration-200">
                SageFlow
            </span>
        </Link>
    </div>
)

export default AuthNavbar
