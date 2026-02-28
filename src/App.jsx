import { useRef } from 'react'
import { SelectionProvider } from './contexts/SelectionContext'
import { NetworkProvider } from './contexts/NetworkContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ControlPanel from './components/ui/ControlPanel'
import ThemeToggle from './components/ui/ThemeToggle'
import PaneLayout from './components/PaneLayout'
import './App.css'

function App() {
  const resetLayoutRef = useRef(null)

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
                <button
                  className="control-button"
                  onClick={() => resetLayoutRef.current?.()}
                  title="Equal Width Panes"
                >
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ display: 'block' }}>
                    <rect x="1" y="1" width="4.5" height="14" rx="1" />
                    <rect x="7.75" y="1" width="4.5" height="14" rx="1" />
                    <rect x="14.5" y="1" width="4.5" height="14" rx="1" />
                  </svg>
                </button>
                {/* <ThemeToggle /> */}
              </div>
            </header>
            <main className="app-main">
              <PaneLayout onResetRef={resetLayoutRef} />
            </main>
          </div>
        </SelectionProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
