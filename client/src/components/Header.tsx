import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Bell, MessageSquare, Mail, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header = ({ toggleMobileMenu }: HeaderProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={toggleMobileMenu} className="mr-2 text-gray-600 md:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative">
          <form onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Type to search..."
              className="w-full md:w-64 pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-[#ef5350] rounded-full flex items-center justify-center text-xs text-white">3</span>
          </button>
        </div>
        <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
          <Mail className="h-5 w-5" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user?.username || "User"} />
          <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
