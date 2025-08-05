import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Trash2, Bell, BellOff } from "lucide-react";

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "New playlist added",
    message: "Your playlist 'Summer Vibes' has been created successfully",
    time: "5 min ago",
    date: "Today",
    read: false,
    type: "success"
  },
  {
    id: 2,
    title: "Song upload complete",
    message: "Your song 'Dancing in the Rain' has been uploaded and is ready to play",
    time: "1 hour ago",
    date: "Today",
    read: false,
    type: "info"
  },
  {
    id: 3,
    title: "New follower",
    message: "DJ Harmony is now following your content",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
    type: "info"
  },
  {
    id: 4,
    title: "Upload error",
    message: "Your audio file could not be processed. Please try again.",
    time: "Yesterday",
    date: "Yesterday",
    read: false,
    type: "error"
  },
  {
    id: 5,
    title: "Payment reminder",
    message: "Your subscription will renew in 3 days",
    time: "2 days ago",
    date: "Older",
    read: true,
    type: "warning"
  },
  {
    id: 6,
    title: "New feature available",
    message: "Try our new AI-powered music recommendations",
    time: "3 days ago",
    date: "Older",
    read: true,
    type: "info"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.read;
    return true;
  });
  
  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    if (!groups[notification.date]) {
      groups[notification.date] = [];
    }
    
    groups[notification.date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Remove a notification
  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get notification background color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white p-6 rounded-xl mb-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="text-white/90">
          View and manage all your USEA Music notifications
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all" className="rounded-md">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="rounded-md">
                  Unread
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={!notifications.some(n => !n.read)}
                  className="text-xs"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all as read
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-6">
              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any notifications at the moment.</p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                  <div key={date} className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                    <div className="space-y-3">
                      {dateNotifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                            notification.read ? 'opacity-70' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => markAsRead(notification.id)}
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeNotification(notification.id)}
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-6">
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="text-center py-16">
                  <BellOff className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-gray-500">You've read all your notifications.</p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                  <div key={date} className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                    <div className="space-y-3">
                      {dateNotifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as read</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeNotification(notification.id)}
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}