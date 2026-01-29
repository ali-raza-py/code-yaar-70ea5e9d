import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, LogOut, Shield, User } from "lucide-react";
import codeYaarLogo from "@/assets/code-yaar-logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Roadmap", path: "/ai-tool" },
  { name: "Courses", path: "/courses" },
  { name: "DSA", path: "/algorithms" },
];

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 80;
  const location = useLocation();

  // Set light theme as default
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setIsDark(false);
  }, []);

  // Smart scroll-aware navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;
      
      // Determine if scrolled past threshold
      setIsScrolled(currentScrollY > 20);
      
      // Only hide/show after scrolling past threshold
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
      } else if (scrollDiff > 10) {
        // Scrolling down - hide navbar
        setIsVisible(false);
      } else if (scrollDiff < -10) {
        // Scrolling up - show navbar
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      } ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50" 
          : "bg-transparent"
      }`}
      style={{ border: "none", boxShadow: isScrolled ? undefined : "none" }}
    >
      <div 
        className="flex items-center justify-between transition-all duration-300"
        style={{
          paddingTop: isScrolled ? "8px" : "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: isScrolled ? "8px" : "0px",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center transition-transform duration-300 ease-out hover:scale-105">
          <img 
            src={codeYaarLogo} 
            alt="Code Yaar" 
            className={`w-auto object-contain transition-all duration-300 ${
              isScrolled ? "h-16 md:h-18 lg:h-20" : "h-20 md:h-24 lg:h-28"
            }`}
          />
        </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out hover:scale-105 ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out hover:scale-105 ${
                  location.pathname === "/admin"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-1" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-out hover:scale-110"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary transition-all duration-300 ease-out hover:bg-secondary/80">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="transition-all duration-300 ease-out hover:scale-110"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm" className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-glow">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground transition-all duration-300 ease-out hover:scale-110"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              className="transition-all duration-300 ease-out hover:scale-110"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-4 bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                  location.pathname === "/admin"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-1" />
                Admin
              </Link>
            )}
            {user ? (
              <Button variant="outline" className="w-full mt-2 transition-all duration-300 ease-out" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full mt-2 transition-all duration-300 ease-out hover:shadow-glow">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
