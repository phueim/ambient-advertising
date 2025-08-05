import { useState, useRef, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "New playlist added",
    message: "Your playlist has been created successfully",
    time: "5 min ago",
    read: false
  },
  {
    id: 2,
    title: "Song upload complete",
    message: "Your song has been uploaded and is ready to play",
    time: "1 hour ago",
    read: false
  },
  {
    id: 3,
    title: "New follower",
    message: "DJ Harmony is now following your content",
    time: "2 days ago", 
    read: true
  }
];

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 border border-gray-200 transition-all">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-primary hover:text-primary/80"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full"
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100">
            <Link href="/notifications">
              <span className="text-xs text-primary hover:underline block text-center cursor-pointer">
                View all notifications
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}