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
import { Menu, X } from "lucide-react";

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
          className="text-sm font-medium text-foreground/80 hover:text-destructive transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <ModeToggle />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-foreground/10 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-t md:hidden z-50 flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkClass(item.path)}
            >
              {item.label}
            </Link>
          ))}

          <span className="cursor-pointer px-4 py-1 rounded-full bg-foreground/10 text-foreground font-medium text-sm text-center">
            {currentUser.name || "Guest"}
          </span>

          {currentUser.name &&
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground/80 hover:text-destructive transition-colors text-left"
            >
              Logout
            </button>
          }
        </div>
      )}
    </nav>
  );
};

export default Navbar;