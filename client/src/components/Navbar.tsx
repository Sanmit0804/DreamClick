import React, { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Menu, UserPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Home" },
    { path: "/explore", label: "Explore" },
    { path: "/video-templates", label: "Video Templates" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const getLinkClass = (path: string) =>
    cn(
      "transition-colors hover:text-primary",
      location.pathname === path
        ? "text-primary font-semibold"
        : "text-foreground/80"
    );

  // Dynamic navbar classes - FIXED FOR LIGHT MODE
  const navbarClasses = cn(
    "w-full px-4 sm:px-8 py-3 flex items-center justify-between relative z-50 transition-all duration-300",
    "sticky top-0",
    // Background that works in BOTH modes
    isScrolled
      ? "bg-background/50 backdrop-blur-sm border-b"
      : "bg-transparent/80 backdrop-blur-sm border-transparent"
  );

  // Text classes that work in BOTH modes
  const textClasses = cn(
    "transition-colors duration-300",
    isScrolled ? "text-foreground" : "text-foreground/90"
  );

  // User badge classes - FIXED FOR LIGHT MODE
  const userBadgeClasses = cn(
    "cursor-pointer px-4 py-1 rounded-full font-medium text-sm transition-all duration-300",
    isScrolled
      ? "bg-foreground/10 text-foreground"
      : "bg-foreground/10 text-foreground/90"
  );

  return (
    <nav className={navbarClasses}>
      {/* Logo */}
      <div
        className={cn(
          "text-2xl font-bold tracking-tight cursor-pointer md:absolute md:left-8",
          textClasses
        )}
        onClick={() => navigate("/dashboard")}
      >
        Dream Click
      </div>

      {/* Desktop Menu - Centered */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <NavigationMenuLink asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      getLinkClass(item.path),
                      textClasses
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Desktop Right Side Items */}
      <div className="hidden md:flex items-center gap-4 absolute right-8">
        <span
          className={userBadgeClasses}
          onClick={() => navigate('/admin')}
        >
          {currentUser.name || "Guest"}
        </span>

        <ModeToggle />

        <button
          onClick={handleLogout}
          className={cn(
            "text-sm font-medium",
            textClasses,
            "hover:text-red-500 transition-colors duration-300"
          )}
        >
          {currentUser.name ? 'Logout' : 'Login'}
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <ModeToggle />

        {/* Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                textClasses,
                "hover:bg-accent/50 transition-all duration-300"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm sm:w-[540px] pr-0"
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="text-left px-6">
              </SheetHeader>

              {/* User Info Section */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" onClick={() => navigate('/admin')}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {currentUser.name || "Guest User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email || "Welcome to our app!"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Navigation Links */}
              <nav className="flex-1 px-3 py-4">
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-12 px-3"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${location.pathname === item.path
                          ? 'bg-primary'
                          : 'bg-muted-foreground/30'
                        }`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {index === 2 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          New
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </nav>

              <Separator />

              {/* Action Section */}
              <div className="p-4 space-y-3">
                {currentUser.name ? (
                  <div className="space-y-2">
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      className="w-full gap-2"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        navigate('/login?mode=signup');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;