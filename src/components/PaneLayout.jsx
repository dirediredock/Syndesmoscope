import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useNetwork } from '../contexts/NetworkContext'
import NodeLinkPane from './panes/NodeLinkPane'
import HopCensusPane from './panes/HopCensusPane'
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

      <Panel
        defaultSize={20}
        minSize={1.7}
        className="panel"
      >
        <NodeLinkPane
          data={networkData?.edgelist}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      {/* <Panel
        defaultSize={20}
        minSize={1.7}
        className="panel"
      >
        <HopCensusPane
          data={networkData?.censusNode}
          networkName={currentNetwork?.name}
        />
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" /> */}

      {/*********************************************************************/}

      <Panel
        defaultSize={20}
        minSize={1.7}
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
        minSize={1.7}
        className="panel"
      >
        <KSnakesPane
          data={networkData?.kSnakes}
          networkName={currentNetwork?.name}
        />
      </Panel>

      {/*********************************************************************/}

    </PanelGroup>
  )
}

export default PaneLayout
