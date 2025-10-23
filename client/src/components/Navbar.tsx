import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { HelpCircle, LogIn, LogOut, Menu, Settings, User, UserPlus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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

  return (
    <nav className="w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b bg-background relative">
      {/* Logo */}
      <div
        className="text-2xl font-bold tracking-tight cursor-pointer md:absolute md:left-8"
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
                  <Link to={item.path} className={getLinkClass(item.path)}>
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
        <span className="cursor-pointer px-4 py-1 rounded-full bg-foreground/10 text-foreground font-medium text-sm" onClick={() => navigate('/admin')}>
          {currentUser.name || "Guest"}
        </span>

        <ModeToggle />

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-foreground/80 hover:text-destructive transition-colors text-left"
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
              className="md:hidden hover:bg-accent"
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
                      variant={getLinkClass(item.path).includes('bg-accent') ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-12 px-3"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {/* Add icons based on your menu items */}
                      <div className={`w-2 h-2 rounded-full ${getLinkClass(item.path).includes('bg-accent')
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

                {/* Quick Actions */}
                {/* <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="h-3 w-3" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <HelpCircle className="h-3 w-3" />
                      Help
                    </Button>
                  </div>
                </div> */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;