import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

interface AuthCardShellProps {
  children: React.ReactNode;
  reducedMotion: boolean | null;
}

export function AuthCardShell({ children, reducedMotion }: AuthCardShellProps) {
  const easing: [number, number, number, number] = [0.4, 0, 0.2, 1];
  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: easing };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
