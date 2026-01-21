import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useNetwork } from '../contexts/NetworkContext'
import NodeLinkPane from './panes/NodeLinkPane'
// import HopCensusPane from './panes/HopCensusPane'
import KSnakesPane from './panes/KSnakesPane'
import './PaneLayout.css'

function PaneLayout() {
  const { networkData, currentNetwork } = useNetwork()

  return (
    <PanelGroup 
      direction="horizontal" 
      className="panel-group"
      autoSaveId="syndesmoscope-layout"
    >

      {/*********************************************************************/}
      {/*********************************************************************/}

      <Panel 
        defaultSize={33} 
        minSize={1.7}
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
        defaultSize={33} 
        minSize={1.7}
        className="panel"
      >
        <KSnakesPane 
          data={networkData?.kSnakes}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel 
        defaultSize={33} 
        minSize={1.7}
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
        defaultSize={33} 
        minSize={1.7}
        className="panel"
      >
        <NodeLinkPane 
          data={networkData?.nodeLink}
          networkName={currentNetwork?.name}
        />
      </Panel>

      {/*********************************************************************/}
      {/*********************************************************************/}

      {/* <Panel 
        defaultSize={34} 
        minSize={10}
        className="panel"
      >
        <HopCensusPane 
          data={networkData?.hopCensus}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      <Panel 
        defaultSize={33} 
        minSize={10}
        className="panel"
      >
        <KSnakesPane 
          data={networkData?.kSnakes}
          networkName={currentNetwork?.name}
        />
      </Panel> */}

    </PanelGroup>
  )
}

export default PaneLayout
