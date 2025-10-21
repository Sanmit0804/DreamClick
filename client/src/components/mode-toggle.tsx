import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  // Show sun icon for light mode, moon for dark mode, and sun for system (light-like)
  const getThemeIcon = () => {
    if (theme === "dark") {
      return <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
    } else {
      return <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
    }
  }

  // Get the next theme for screen readers
  const getNextTheme = () => {
    return theme === "light" ? "dark" : "light"
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${getNextTheme()} mode`}
    >
      {getThemeIcon()}
      <span className="sr-only">Switch to {getNextTheme()} mode</span>
    </Button>
  )
}