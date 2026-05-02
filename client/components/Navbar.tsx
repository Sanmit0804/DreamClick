

import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Menu, UserPlus, ShoppingCart, Heart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import useCart from "@/hooks/useCart";
import useFavorites from "@/hooks/useFavorites";
import authService from "@/services/auth";

/** Tiny animated count badge — pure CSS, always visible */
const CountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-black
        min-w-[18px] h-[18px] px-[3px] rounded-full flex items-center justify-center
        leading-none z-50 shadow-md pointer-events-none
        animate-[navBadgePop_0.35s_cubic-bezier(.175,.885,.32,1.275)_both]"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user: currentUser } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
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
      pathname === path ? "text-primary font-semibold" : "text-foreground/80"
    );

  const navbarClasses = cn(
    "w-full px-4 sm:px-6 py-3 flex items-center justify-between relative z-50 transition-all duration-300 sticky top-0",
    isScrolled
      ? "bg-background/60 backdrop-blur-md"
      : "bg-transparent backdrop-blur-sm border-transparent"
  );

  const textClasses = cn(
    "transition-colors duration-300",
    isScrolled ? "text-foreground" : "text-foreground/90"
  );

  const userBadgeClasses = cn(
    "cursor-pointer px-3 py-1 rounded-full font-medium text-sm transition-all duration-300",
    "bg-foreground/10 text-foreground/90"
  );

  const showFav = favorites.length > 0 || pathname === "/video-templates";
  const showCart = cart.length > 0 || pathname === "/video-templates";

  return (
    <nav className={navbarClasses}>
      {/* ── Left Side (Logo) ── */}
      <div className="flex items-center md:flex-1">
        <div
          className={cn("text-xl font-bold tracking-tight cursor-pointer", textClasses)}
          onClick={() => navigate("/dashboard")}
        >
          Dream Click
        </div>
      </div>

      {/* ── Center (Desktop Menu) ── */}
      <div className="hidden md:flex items-center justify-center">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <NavigationMenuLink asChild>
                  <Link to={item.path} className={cn(getLinkClass(item.path), textClasses)}>
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* ── Right Side (Desktop Actions) ── */}
      <div className="hidden md:flex items-center justify-end gap-2 md:flex-1">
        <span className={userBadgeClasses} onClick={() => navigate("/admin")}>
          {currentUser?.name ?? "Guest"}
        </span>

        <ModeToggle />

        <button
          onClick={handleLogout}
          className={cn("text-sm font-medium px-2", textClasses, "hover:text-red-500 transition-colors")}
        >
          {currentUser?.name ? "Logout" : "Login"}
        </button>

        {/* Favorites */}
        {showFav && (
          <button
            onClick={() => navigate("/favorites")}
            className={cn("relative p-2 rounded-full hover:bg-foreground/10 transition-colors shrink-0", textClasses)}
            title="Favorites"
          >
            <Heart className="h-5 w-5" />
            <CountBadge count={favorites.length} />
          </button>
        )}

        {/* Cart */}
        {showCart && (
          <button
            onClick={() => navigate("/cart")}
            className={cn("relative p-2 rounded-full hover:bg-foreground/10 transition-colors shrink-0", textClasses)}
            title="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <CountBadge count={cart.length} />
          </button>
        )}
      </div>

      {/* ── Mobile Right Area ─── */}
      <div className="md:hidden flex items-center justify-end gap-1">
        {showFav && (
          <button
            onClick={() => navigate("/favorites")}
            className={cn("relative p-2 rounded-full hover:bg-foreground/10 transition-colors shrink-0", textClasses)}
            title="Favorites"
          >
            <Heart className="h-5 w-5" />
            <CountBadge count={favorites.length} />
          </button>
        )}

        {showCart && (
          <button
            onClick={() => navigate("/cart")}
            className={cn("relative p-2 rounded-full hover:bg-foreground/10 transition-colors shrink-0", textClasses)}
            title="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <CountBadge count={cart.length} />
          </button>
        )}

        <ModeToggle />

        {/* Hamburger Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("hover:bg-accent/50 transition-all", textClasses)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] max-w-xs pr-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="text-left px-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>

              {/* User Info */}
              <div className="px-6 py-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer"
                  onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser?.creatorProfile?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{currentUser?.name ?? "Guest User"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser?.email ?? "Welcome to DreamClick!"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Nav Links */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <Button
                      key={item.path}
                      variant={pathname === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-12 px-3"
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    >
                      <div className={`w-2 h-2 rounded-full ${pathname === item.path ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {index === 1 && (
                        <Badge variant="outline" className="ml-2 text-xs">New</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </nav>

              <Separator />

              {/* Auth Actions */}
              <div className="p-4 space-y-2">
                {currentUser?.name ? (
                  <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="default"
                      className="w-full gap-2"
                      onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => { navigate("/login?mode=signup"); setMobileMenuOpen(false); }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Button>
                  </>
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