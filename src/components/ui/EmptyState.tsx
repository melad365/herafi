import { type ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center">
      <div className="flex flex-col items-center">
        <div className="text-burgundy-300 mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-burgundy-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
        )}
        {action && (
          <>
            {action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center justify-center px-4 py-2 bg-burgundy-800 hover:bg-burgundy-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center justify-center px-4 py-2 bg-burgundy-800 hover:bg-burgundy-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {action.label}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
