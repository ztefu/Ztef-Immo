"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 mb-8"
    >
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left justify-center sm:justify-start w-full sm:w-auto">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
