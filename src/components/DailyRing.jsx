import { motion } from 'framer-motion';

export default function DailyRing({ completed, total }) {
    // Avoid division by zero
    const percentage = total > 0 ? completed / total : 0;
    // Circle properties
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - percentage * circumference;

    return (
        <div id="daily-ring-container" className="relative flex items-center justify-center w-14 h-14">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeLinecap="round"
                    className="text-blue-600"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                />
            </svg>

            {/* Text / Checkmark inside */}
            <div className="text-xs font-bold text-gray-700">
                {completed}/{total}
            </div>
        </div>
    );
}
