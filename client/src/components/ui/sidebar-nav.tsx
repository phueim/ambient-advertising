import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
  currentPath: string;
}

export function SidebarNav({ items, currentPath }: SidebarNavProps) {
  return (
    <nav>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <div
                className={cn(
                  "flex items-center px-4 py-2.5 hover:bg-sidebar-accent/80 rounded-lg transition-all duration-200 cursor-pointer font-medium",
                  currentPath === item.href 
                    ? "bg-gradient-to-r from-primary/90 to-primary/70 text-white shadow-md" 
                    : "text-sidebar-foreground/90 hover:text-white"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center mr-3",
                  currentPath === item.href ? "text-white" : "text-sidebar-foreground/90"
                )}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.title}</span>
                {currentPath === item.href && (
                  <span className="ml-auto w-1.5 h-5 bg-secondary/90 rounded-full" />
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
