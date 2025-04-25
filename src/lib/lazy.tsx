import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';

interface LoadingProps {
  isLoading: boolean;
  pastDelay: boolean;
  error: Error | null;
}

const DefaultLoading = ({ isLoading, pastDelay, error }: LoadingProps) => {
  if (error) {
    return <div>Ошибка загрузки...</div>;
  }
  if (isLoading && pastDelay) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return null;
};

export const withLazy = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType<LoadingProps> = DefaultLoading
) => {
  const LazyComponent = dynamic(importFunc, {
    loading: LoadingComponent,
    suspense: true,
  });

  return function WithLazy(props: P) {
    return (
      <Suspense fallback={<LoadingComponent isLoading={true} pastDelay={false} error={null} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}; 