import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', title, children, className = "" }) => {
  const styles = {
    info: {
      container: "bg-primary-50 border-primary-200",
      icon: <Info className="h-5 w-5 text-primary-600" />,
      title: "text-primary-800",
      text: "text-primary-700"
    },
    success: {
      container: "bg-emerald-50 border-emerald-200",
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      title: "text-emerald-800",
      text: "text-emerald-700"
    },
    warning: {
      container: "bg-amber-50 border-amber-200",
      icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
      title: "text-amber-800",
      text: "text-amber-700"
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      title: "text-red-800",
      text: "text-red-700"
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`rounded-lg border p-4 ${style.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${style.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''} ${style.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
