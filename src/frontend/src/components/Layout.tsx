import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, PlusCircle, User } from "lucide-react";
import { useState } from "react";
import { useMobileAuth } from "../hooks/useMobileAuth";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import MobileLoginDialog from "./MobileLoginDialog";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { phoneNumber, logout, isAuthenticated } = useMobileAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/generated/ols-logo.dim_400x300.png"
              alt="OLS Marketplace"
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/create-listing">
                  <Button variant="default" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Sell Item</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">My Ads</span>
                  </Button>
                </Link>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatPhoneNumber(phoneNumber!)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} OLS Marketplace</span>
              <span>•</span>
              <span>Built with ❤️ using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "ols-marketplace",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      <MobileLoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
}
