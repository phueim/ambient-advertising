import { useState, useEffect } from "react";
import { Bell, MessageCircle, Mail, Menu, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [profileImageKey, setProfileImageKey] = useState(0);
  
  console.log("Header render - user profile logo:", user?.profileLogo ? "Present" : "Not present");
  console.log("Current user profile logo length:", user?.profileLogo?.length || 0);
  
  // Force re-render when user.profileLogo changes
  useEffect(() => {
    setProfileImageKey(prev => prev + 1);
  }, [user?.profileLogo]);
  
  const userInitials = user?.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : "US";

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Type to search..."
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="text-gray-600">
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-600">
          <Mail className="h-5 w-5" />
        </Button>
        
        <Link href="/settings">
          <a>
            <div className="relative">
              {user?.profileLogo ? (
                <img 
                  src={user.profileLogo} 
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    console.log("Profile image error, showing fallback");
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium ${user?.profileLogo ? 'hidden' : 'flex'}`}
              >
                {userInitials}
              </div>
            </div>
          </a>
        </Link>
      </div>
    </header>
  );
}
