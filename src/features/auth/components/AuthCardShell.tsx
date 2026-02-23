import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { EASE_SMOOTH, MOTION_DURATION } from "@/lib/motion";

interface AuthCardShellProps {
  children: React.ReactNode;
  reducedMotion: boolean | null;
}

export function AuthCardShell({ children, reducedMotion }: AuthCardShellProps) {
  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: MOTION_DURATION.enter, ease: EASE_SMOOTH };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
        className="w-full max-w-sm space-y-6"
      >
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
