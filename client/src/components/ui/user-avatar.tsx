import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  className?: string;
}

export function UserAvatar({ username, className }: UserAvatarProps) {
  // Get initials from username
  const initials = username
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <Avatar className={cn("bg-primary", className)}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
