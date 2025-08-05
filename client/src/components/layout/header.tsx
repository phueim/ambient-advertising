import { useState } from "react";
import { MessageSquare, Mail, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { NotificationMenu } from "@/components/ui/notification-menu";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function Header({ setMobileOpen }: HeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  return (
    <header className="bg-white dark:bg-card shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden mr-3 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        

      </div>
      
      <div className="flex items-center space-x-1">
        <NotificationMenu />
        
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
          <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 rounded-full"
          onClick={() => setLocation('/contact')}
        >
          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
        
        <div className="ml-2 flex items-center pl-2">
          <UserAvatar 
            username={user?.username || "User"}
            className="h-9 w-9 ring-2 ring-primary/10"
          />
          <div className="ml-3 hidden md:block">
            <div className="text-sm font-medium">{user?.username || "User"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.companyName || "USEA Music"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
