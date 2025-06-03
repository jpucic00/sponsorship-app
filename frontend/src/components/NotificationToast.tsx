import React from "react";
import { CheckCircle, X } from "lucide-react";

interface NotificationToastProps {
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  onClose,
}) => {
  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-white" size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
