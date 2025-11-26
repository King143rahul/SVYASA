import { Moon, Sun, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/campus-confessions-logo.png";

interface HeaderProps {
  onTrendingClick?: () => void;
}

const Header = ({ onTrendingClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Svyasa Secrets" className="h-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold gradient-text">Svyasa Secrets</h1>
            <p className="text-xs text-muted-foreground">Share anonymously</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="neon-glow-hover"
            onClick={onTrendingClick}
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="neon-glow-hover"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
