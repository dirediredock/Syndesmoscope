import { useRef, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useNetwork } from '../contexts/NetworkContext'
import NodeLinkPane from './panes/NodeLinkPane'
import HopCensusPane from './panes/HopCensusPane'
import KSnakesPane from './panes/KSnakesPane'
import AdjacencyGridPane from './panes/AdjacencyGridPane'
import './PaneLayout.css'

function PaneLayout({ onResetRef, paneTypes }) {
  const { networkData, currentNetwork } = useNetwork()
  const panelGroupRef = useRef(null)

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        panelGroupRef.current?.setLayout([25, 25, 25, 25])
      }
    }
  }, [onResetRef])

  function renderPane(paneType) {
    const networkName = currentNetwork?.name

    switch (paneType) {
      case 'kSnakes':
        return (
          <KSnakesPane
            data={networkData?.kSnakes}
            nodeLinkData={networkData?.nodeLink}
            networkName={networkName}
          />
        )
      case 'hopCensus':
        return (
          <HopCensusPane
            data={networkData?.censusStub}
            networkName={networkName}
          />
        )
      case 'nodeLink':
        return (
          <NodeLinkPane
            data={networkData?.nodeLink}
            networkName={networkName}
          />
        )
      case 'adjacencyGrid':
        return (
          <AdjacencyGridPane
            data={networkData?.adjacencyGrid}
            networkName={networkName}
          />
        )
      default:
        return null
    }
  }

  return (
    <PanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      className="panel-group"
      autoSaveId="syndesmoscope-layout"
    >

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.3}
        className="panel"
      >
        {renderPane(paneTypes[0])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.3}
        className="panel"
      >
        {renderPane(paneTypes[1])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.2}
        className="panel"
      >
        {renderPane(paneTypes[2])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.2}
        className="panel"
      >
        {renderPane(paneTypes[3])}
      </Panel>

      {/*********************************************************************/}

    </PanelGroup>
  )
}

export default PaneLayout
