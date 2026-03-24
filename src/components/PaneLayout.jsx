import { useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNetwork } from "../contexts/NetworkContext";
import NodeLinkPane from "./panes/NodeLinkPane";
import HopCensusPane from "./panes/HopCensusPane";
import KSnakesPane from "./panes/KSnakesPane";
import AdjacencyMatrixPane from "./panes/AdjacencyMatrixPane";
import "./PaneLayout.css";

const PANE_TYPE_CYCLE = ["kSnakes", "hopCensus", "adjacencyMatrix", "nodeLink"];
const PANE_TYPE_LABELS = {
  kSnakes: "kSnakes",
  hopCensus: "HopCensus",
  adjacencyMatrix: "AdjacencyMatrix",
  nodeLink: "ForceDirected",
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
  const savedLayoutRef = useRef(null);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        if (savedLayoutRef.current) {
          panelGroupRef.current?.setLayout(savedLayoutRef.current);
          savedLayoutRef.current = null;
        } else {
          savedLayoutRef.current = panelGroupRef.current?.getLayout() ?? null;
          panelGroupRef.current?.setLayout([25, 25, 25, 25]);
        }
      };
    }
  }, [onResetRef]);

  function renderCycleBtn(idx) {
    const type = paneTypes[idx];
    return (
      <div className="size-controls">
        <button
          className="size-toggle-btn"
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
      </div>
    );
  }

  function renderPane(paneType, cycleButton) {
    const networkName = currentNetwork?.name;

    switch (paneType) {
      case "kSnakes":
        return (
          <KSnakesPane
            data={networkData?.kSnakes}
            nodeLinkData={networkData?.nodeLink}
            networkName={networkName}
            cycleButton={cycleButton}
          />
        );
      case "hopCensus":
        return (
          <HopCensusPane
            data={networkData?.censusStub}
            networkName={networkName}
            cycleButton={cycleButton}
          />
        );
      case "nodeLink":
        return (
          <NodeLinkPane
            data={networkData?.nodeLink}
            networkName={networkName}
            cycleButton={cycleButton}
          />
        );
      case "adjacencyMatrix":
        return (
          <AdjacencyMatrixPane
            data={networkData?.adjacencyMatrix}
            networkName={networkName}
            cycleButton={cycleButton}
          />
        );
      default:
        return null;
    }
  }

  if (isPortrait) {
    const type = paneTypes[activePaneIndex];
    const portraitCycleBtn = (
      <div className="size-controls">
        <button
          className="size-toggle-btn"
          onClick={() => {
            onActivePaneChange((activePaneIndex + 1) % paneTypes.length);
          }}
          aria-label="Cycle pane"
          title="Cycle pane"
        >
          {PANE_TYPE_LABELS[type] || type}
        </button>
      </div>
    );
    return (
      <div className="panel-group panel-group--portrait">
        <div className="panel">
          {renderPane(type, portraitCycleBtn)}
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
        {renderPane(paneTypes[0], renderCycleBtn(0))}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={7} minSize={0.6} className="panel">
        {renderPane(paneTypes[1], renderCycleBtn(1))}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={16} minSize={0.6} className="panel">
        {renderPane(paneTypes[2], renderCycleBtn(2))}
      </Panel>

      <PanelResizeHandle className="panel-resize-handle" />

      {/*********************************************************************/}

      <Panel defaultSize={25} minSize={0.6} className="panel">
        {renderPane(paneTypes[3], renderCycleBtn(3))}
      </Panel>

      {/*********************************************************************/}
    </PanelGroup>
  );
}

export default PaneLayout;
