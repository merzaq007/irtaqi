import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Module, ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link to={`${ROUTE_PATHS.MODULE}/${module.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="group relative overflow-hidden border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary leading-relaxed">
              {module.name}
            </h3>
            <ChevronLeft className="h-6 w-6 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-[-6px] group-hover:text-primary" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Card>
      </motion.div>
    </Link>
  );
}
