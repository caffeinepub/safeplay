import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Shield, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  incidentCount: number;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Home" },
  { id: "fields", label: "Field Status" },
  { id: "incidents", label: "Incidents" },
  { id: "checklist", label: "Checklists" },
  { id: "credentials", label: "Team" },
  { id: "environment", label: "Environment" },
];

export default function Header({
  activeTab,
  onTabChange,
  incidentCount,
}: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (e: any) {
        if (e?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortId = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : "Guest";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-6 border-b border-border"
      style={{
        background: "oklch(0.10 0.04 258 / 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.22 25), oklch(0.45 0.20 25))",
          }}
        >
          <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-foreground text-lg tracking-tight">
          SafePlay
        </span>
      </div>

      {/* Nav */}
      <nav
        className="hidden md:flex items-center gap-1 flex-1"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.id}
            data-ocid={`nav.${item.id}.link`}
            onClick={() => onTabChange(item.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          data-ocid="header.bell.button"
          onClick={() => onTabChange("incidents")}
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          aria-label="View incidents"
        >
          <Bell className="w-5 h-5" />
          {incidentCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="header.user.button"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-secondary text-foreground text-xs">
                  <User className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm text-muted-foreground">
                {shortId}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              data-ocid="header.auth.button"
              onClick={handleAuth}
              disabled={isLoggingIn || isInitializing}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingIn
                ? "Connecting…"
                : isAuthenticated
                  ? "Logout"
                  : "Login"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isAuthenticated && (
          <Badge
            variant="outline"
            className="hidden sm:flex text-xs border-primary/40 text-primary"
          >
            Coordinator
          </Badge>
        )}
      </div>
    </header>
  );
}
