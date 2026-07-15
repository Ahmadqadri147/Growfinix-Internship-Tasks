import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const sizeClasses = sizes[size] || sizes.medium;

  return (
    <div className="flex items-center justify-center p-8">
      <div className={cn('relative', className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={cn('absolute inset-0 border-4 border-t-transparent border-purple-500 rounded-full', sizeClasses)}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={cn('absolute inset-2 border-4 border-t-transparent border-blue-500 rounded-full', sizeClasses)}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={cn('absolute inset-4 border-4 border-t-transparent border-cyan-500 rounded-full', sizeClasses)}
        />
      </div>
    </div>
  );
};

const PulseLoader = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
    xlarge: 'w-5 h-5'
  };

  const sizeClasses = sizes[size] || sizes.medium;

  return (
    <div className="flex items-center justify-center p-4 gap-1">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15
          }}
          className={cn('bg-gradient-primary rounded-full', sizeClasses)}
        />
      ))}
    </div>
  );
};

const ProgressLoader = ({ progress = 0, size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-24 h-2',
    medium: 'w-32 h-2',
    large: 'w-48 h-3',
    xlarge: 'w-64 h-4'
  };

  const sizeClasses = sizes[size] || sizes.medium;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="space-y-2">
        <div className={cn('progress-bar', sizeClasses)}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Generating your masterpiece...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

const TextLoader = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div className="relative">
        <div className="absolute inset-0 border-2 border-t-transparent border-purple-500 rounded-full w-6 h-6 animate-spin" />
        <div className="absolute inset-0 border-2 border-t-transparent border-blue-500 rounded-full w-6 h-6 animate-spin" style={{ animationDelay: '0.15s' }} />
        <div className="absolute inset-0 border-2 border-t-transparent border-cyan-500 rounded-full w-6 h-6 animate-spin" style={{ animationDelay: '0.3s' }} />
      </div>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
};

const EmptyStateLoader = ({ message = 'No images yet' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-4 relative">
        <div className="absolute inset-0 border-4 border-t-transparent border-purple-500 rounded-full animate-spin" />
        <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }} />
        <div className="absolute inset-0 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin" style={{ animationDelay: '0.3s' }} />
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

export { LoadingSpinner, PulseLoader, ProgressLoader, TextLoader, EmptyStateLoader };