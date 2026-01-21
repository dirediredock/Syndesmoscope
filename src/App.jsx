import { useState } from 'react'
import { SelectionProvider } from './contexts/SelectionContext'
import { NetworkProvider } from './contexts/NetworkContext'
import ControlPanel from './components/ui/ControlPanel'
import PaneLayout from './components/PaneLayout'
import './App.css'

function App() {
  return (
    <NetworkProvider>
      <SelectionProvider>
        <div className="app">
          <header className="app-header">
            <div className="app-title">
            <h1>S Y N D E S M O S C O P E</h1>
              {/* <span className="app-version">V01</span> */}
            </div>
            <ControlPanel />
          </header>
          <main className="app-main">
            <PaneLayout />
          </main>
        </div>
      </SelectionProvider>
    </NetworkProvider>
  )
}

export default App
