import { useState, useRef, useEffect } from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
}

export function NotificationsDropdown({
  notifications,
  markAsRead,
  markAllAsRead,
  removeNotification
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get background color based on notification type
  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20';
      case 'error': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

  // Get border color based on notification type
  const getNotificationBorder = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-amber-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </Button>
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm pointer-events-none">
          {unreadCount}
        </span>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-card border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    className="text-xs text-primary hover:text-primary/80 transition-colors" 
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
                <Link href="/notifications" className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  View all
                </Link>
              </div>
            </div>
            
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications to display
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start ${
                      notification.read ? 'opacity-75' : 'bg-gray-50/50 dark:bg-gray-800/20'
                    } border-l-4 ${getNotificationBorder(notification.type)}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <Link href="/notifications" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center justify-center">
                View all notifications <ArrowRight className="ml-1" size={12} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}