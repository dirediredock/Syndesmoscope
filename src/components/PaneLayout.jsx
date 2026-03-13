import { useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNetwork } from "../contexts/NetworkContext";
import NodeLinkPane from "./panes/NodeLinkPane";
import HopCensusPane from "./panes/HopCensusPane";
import KSnakesPane from "./panes/KSnakesPane";
import AdjacencyMatrixPane from "./panes/AdjacencyMatrixPane";
import "./PaneLayout.css";

const PANE_TYPE_CYCLE = ["kSnakes", "hopCensus", "nodeLink", "adjacencyMatrix"];
const PANE_TYPE_LABELS = {
  kSnakes: "kSnakes",
  hopCensus: "HopCensus",
  nodeLink: "NodeLink",
  adjacencyMatrix: "AdjacencyMatrix",
};

function PaneLayout({
  onResetRef,
  paneTypes,
  onPaneTypeChange,
  isPortrait,
  activePaneIndex,
  onActivePaneChange,
}) {
  const { networkData, currentNetwork } = useNetwork();
  const panelGroupRef = useRef(null);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        panelGroupRef.current?.setLayout([25, 25, 25, 25]);
      };
    }
  }, [onResetRef]);

  function renderCycleBtn(idx) {
    const type = paneTypes[idx];
    return (
      <button
        className="pane-cycle-btn"
        onClick={() => {
          const cycleIdx = PANE_TYPE_CYCLE.indexOf(type);
          const next = PANE_TYPE_CYCLE[(cycleIdx + 1) % PANE_TYPE_CYCLE.length];
          onPaneTypeChange(idx, next);
        }}
        aria-label="Cycle pane"
        title="Cycle pane"
      >
        {PANE_TYPE_LABELS[type] || type}
      </button>
    );
  }

  function renderPane(paneType) {
    const networkName = currentNetwork?.name;

    switch (paneType) {
      case "kSnakes":
        return (
          <KSnakesPane
            data={networkData?.kSnakes}
            nodeLinkData={networkData?.nodeLink}
            networkName={networkName}
          />
        );
      case "hopCensus":
        return (
          <HopCensusPane
            data={networkData?.censusStub}
            networkName={networkName}
          />
        );
      case "nodeLink":
        return (
          <NodeLinkPane
            data={networkData?.nodeLink}
            networkName={networkName}
          />
        );
      case "adjacencyMatrix":
        return (
          <AdjacencyMatrixPane
            data={networkData?.adjacencyMatrix}
            networkName={networkName}
          />
        );
      default:
        return null;
    }
  }

  if (isPortrait) {
    const type = paneTypes[activePaneIndex];
    return (
      <div className="panel-group panel-group--portrait">
        <div className="panel">
          <button
            className="pane-cycle-btn"
            onClick={() => {
              onActivePaneChange((activePaneIndex + 1) % paneTypes.length);
            }}
            aria-label="Cycle pane"
            title="Cycle pane"
          >
            {PANE_TYPE_LABELS[type] || type}
          </button>
          {renderPane(type)}
        </div>
      </div>
    );
  }

  return (
    <PanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      className="panel-group"
    >
      {/*********************************************************************/}

      <Panel defaultSize={14} minSize={0.6} className="panel">
        {renderCycleBtn(0)}
        {renderPane(paneTypes[0])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={7} minSize={0.6} className="panel">
        {renderCycleBtn(1)}
        {renderPane(paneTypes[1])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={25} minSize={0.6} className="panel">
        {renderCycleBtn(2)}
        {renderPane(paneTypes[2])}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={16} minSize={0.6} className="panel">
        {renderCycleBtn(3)}
        {renderPane(paneTypes[3])}
      </Panel>

      {/*********************************************************************/}
    </PanelGroup>
  );
}

export default PaneLayout;
