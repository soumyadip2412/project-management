import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function SocialButtons() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-amber-400/30 hover:bg-white/10"
            >
                <FcGoogle size={24} />
                <span className="font-medium">Continue with Google</span>
            </motion.button>

            <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-amber-400/30 hover:bg-white/10"
            >
                <FaGithub size={22} />
                <span className="font-medium">Continue with GitHub</span>
            </motion.button>
        </div>
    );
}