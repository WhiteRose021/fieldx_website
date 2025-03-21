// @/components/page-transition.tsx
import { LinkProps } from "next/link";
import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export const TransitionLink = ({ children, className, ...props }: TransitionLinkProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link {...props} className={className}>
        {children}
      </Link>
    </motion.div>
  );
};

export const PageTransitionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};