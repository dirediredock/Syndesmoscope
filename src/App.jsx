import { useRef, useState, useCallback } from 'react'
import { SelectionProvider } from './contexts/SelectionContext'
import { NetworkProvider, useNetwork } from './contexts/NetworkContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ControlPanel from './components/ui/ControlPanel'
import NetworkSelect from './components/ui/NetworkSelect'
import NetworkInfo from './components/ui/NetworkInfo'
import PaneLayout from './components/PaneLayout'
import './App.css'

const DEFAULT_PANE_TYPES = ['kSnakes', 'hopCensus', 'nodeLink', 'adjacencyGrid']

function AppContent() {
  const resetLayoutRef = useRef(null)
  const [paneTypes, setPaneTypes] = useState(DEFAULT_PANE_TYPES)
  const { isLoading, error } = useNetwork()

  const handlePaneTypeChange = useCallback((panelIndex, newType) => {
    setPaneTypes(prev => {
      const next = [...prev]
      next[panelIndex] = newType
      return next
    })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>S Y N D E S M O S C O P E</h1>
        </div>
        <NetworkSelect />
        <NetworkInfo />
        <div className="app-header-spacer">
          {isLoading && <span className="control-status">L O A D I N G</span>}
          {error && <span className="control-status">{error}</span>}
        </div>
        <ControlPanel
          paneTypes={paneTypes}
          onPaneTypeChange={handlePaneTypeChange}
          onResetLayout={() => resetLayoutRef.current?.()}
        />
      </header>
      <main className="app-main">
        <PaneLayout onResetRef={resetLayoutRef} paneTypes={paneTypes} />
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <SelectionProvider>
          <AppContent />
        </SelectionProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
