import { motion, AnimatePresence } from 'motion/react';
import { Step } from '../types';

interface VisualStackProps {
  steps: Step[];
}

export default function VisualStack({ steps }: VisualStackProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full h-[450px] flex items-stretch gap-10 px-6 z-10">
      {/* Structural Container (The Tall Glass) */}
      <div className="flex-1 max-w-[160px] border-x-4 border-b-4 border-text-dark relative overflow-hidden flex flex-col-reverse group bg-white/5 shadow-inner">
        {/* Top Rim of the glass (Optional: visual flair) */}
        <div className="absolute top-0 inset-x-0 h-1 bg-text-dark opacity-20 z-30" />
        
        {/* Layers */}
        <AnimatePresence mode="popLayout">
          {sortedSteps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: `${100 / Math.max(steps.length, 5)}%`, 
                opacity: 1, 
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.5,
                delay: idx * 0.05 
              }}
              className="w-full relative flex items-center justify-center border-t border-white/20 overflow-hidden"
              style={{ backgroundColor: step.color || '#F2E8DC' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />
              {/* Highlight effect */}
              <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-white/30" />
            </motion.div>
          ))}
          
          {/* Empty Space Filler */}
          {Array.from({ length: Math.max(0, 5 - steps.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 bg-transparent" />
          ))}
        </AnimatePresence>
      </div>

      {/* Technical Labels Column */}
      <div className="flex-1 flex flex-col-reverse relative pr-4">
        <AnimatePresence mode="popLayout">
          {sortedSteps.map((step, idx) => (
            <motion.div
              key={`label-${step.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                height: `${100 / Math.max(steps.length, 5)}%` 
              }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="flex items-center gap-3 relative"
            >
              {/* Leader Line */}
              <div className="absolute -left-8 right-full h-[1px] bg-border-soft flex items-center justify-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-text-accent -ml-0.5" />
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-dark truncate leading-tight">
                  {step.name}
                </span>
                {step.ingredient && (
                  <span className="text-[9px] text-text-accent font-serif italic truncate">
                    {step.ingredient}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Label Spacers */}
          {Array.from({ length: Math.max(0, 5 - steps.length) }).map((_, i) => (
            <div key={`spacer-${i}`} className="flex-1" />
          ))}
        </AnimatePresence>
      </div>

      {/* Vertical Measurement Scale */}
      <div className="absolute -left-2 top-0 bottom-0 w-[1px] bg-border-soft flex flex-col justify-between py-2 pointer-events-none">
        <div className="w-2 h-[1px] bg-border-soft" />
        <div className="w-2 h-[1px] bg-border-soft" />
        <div className="w-2 h-[1px] bg-border-soft" />
        <div className="w-2 h-[1px] bg-border-soft" />
        <div className="w-2 h-[1px] bg-border-soft" />
      </div>
    </div>
  );
}
