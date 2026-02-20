import React from 'react'
import { motion } from 'framer-motion'

/**
 * AuthPageBackground
 *
 * Renders the three animated gradient orbs used as the background on all
 * auth pages (login, signup).  Drop it as the first child of any
 * `min-h-screen relative overflow-hidden` container.
 *
 * Usage:
 *   <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
 *     <AuthPageBackground />
 *     ...content...
 *   </div>
 */
const AuthPageBackground: React.FC = () => (
    <>
        {/* Top-left orb */}
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
                x: [0, 30, 0],
                y: [0, -20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-violet-500 blur-[120px] rounded-full pointer-events-none"
        />

        {/* Bottom-right orb */}
        <motion.div
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.12, 0.22, 0.12],
                x: [0, -40, 0],
                y: [0, 30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-pink-400 to-purple-500 blur-[130px] rounded-full pointer-events-none"
        />

        {/* Centre orb */}
        <motion.div
            animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.18, 0.1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-400 to-purple-400 blur-[100px] rounded-full pointer-events-none"
        />
    </>
)

export default AuthPageBackground
