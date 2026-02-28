import { useRef, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useNetwork } from '../contexts/NetworkContext'
import NodeLinkPane from './panes/NodeLinkPane'
import HopCensusPane from './panes/HopCensusPane'
import KSnakesPane from './panes/KSnakesPane'
import AdjacencyMatrixPane from './panes/AdjacencyMatrixPane'
import './PaneLayout.css'

function PaneLayout({ onResetRef }) {
  const { networkData, currentNetwork } = useNetwork()
  const panelGroupRef = useRef(null)

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        panelGroupRef.current?.setLayout([25, 25, 25, 25])
      }
    }
  }, [onResetRef])

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
        <KSnakesPane
          data={networkData?.kSnakes}
          nodeLinkData={networkData?.nodeLink}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.3}
        className="panel"
      >
        <HopCensusPane
          data={networkData?.censusStub}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.2}
        className="panel"
      >
        <NodeLinkPane
          data={networkData?.nodeLink}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={0.2}
        className="panel"
      >
        <AdjacencyMatrixPane
          data={networkData?.adjacencyMatrix}
          networkName={currentNetwork?.name}
        />
      </Panel>

      {/*********************************************************************/}

    </PanelGroup>
  )
}

export default PaneLayout
