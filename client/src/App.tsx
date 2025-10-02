import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My App</h1>
          <ModeToggle />
        </div>
        <div className="mt-8 space-y-4">
          <Button>Click me</Button>
          <div className="p-4 bg-card text-card-foreground rounded-lg border">
            This is a card to test theme colors
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App