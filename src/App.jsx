import { SelectionProvider } from './contexts/SelectionContext'
import { NetworkProvider } from './contexts/NetworkContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ControlPanel from './components/ui/ControlPanel'
import ThemeToggle from './components/ui/ThemeToggle'
import PaneLayout from './components/PaneLayout'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <SelectionProvider>
          <div className="app">
            <header className="app-header">
              <div className="app-title">
                <h1>S Y N D E S M O S C O P E</h1>
                {/* <span className="app-version">V01</span> */}
              </div>
              <div className="app-header-controls">
                <ControlPanel />
                {/* <ThemeToggle /> */}
              </div>
            </header>
            <main className="app-main">
              <PaneLayout />
            </main>
          </div>
        </SelectionProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
