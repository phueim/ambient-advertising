import { useState } from "react";
import { Bell, MessageSquare, Mail, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const [notifications] = useState(3);

  return (
    <div className="bg-white p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="relative w-64">
          <Input 
            type="text" 
            placeholder="Type to search..."
            className="pl-8 pr-4 py-2 w-full"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-2 top-2.5" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-xs text-white rounded-full h-4 w-4 flex items-center justify-center">
              {notifications}
            </span>
          )}
          <Bell className="w-6 h-6 text-gray-600" />
        </div>

        <MessageSquare className="w-6 h-6 text-gray-600" />
        <Mail className="w-6 h-6 text-gray-600" />

        <Avatar>
          <AvatarImage src={user?.profileImage || ""} alt={user?.username || "User"} />
          <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
