interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading portfolio data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner size="large" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};