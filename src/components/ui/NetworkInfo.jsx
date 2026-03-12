import { useNetwork } from "../../contexts/NetworkContext";
import { useSelection } from "../../contexts/SelectionContext";
import "./ControlPanel.css";

function NetworkInfo() {
  const { currentNetwork } = useNetwork();
  const {
    selectedNodes,
    selectedEdges,
    clearSelectedNodes,
    clearSelectedEdges,
  } = useSelection();

  if (!currentNetwork) return null;

  const nodePct =
    currentNetwork.nodes > 0
      ? Math.round((selectedNodes.size / currentNetwork.nodes) * 100)
      : 0;
  const edgePct =
    currentNetwork.edges > 0
      ? Math.round((selectedEdges.size / currentNetwork.edges) * 100)
      : 0;

  return (
    <div className="network-info">
      <div className="control-group">
        <span className="control-label">Nodes:</span>
        <span className="selection-badge selection-badge--nodes">
          {selectedNodes.size > 0 ? (
            <>
              <strong>{selectedNodes.size}</strong> of{" "}
              <strong>{currentNetwork.nodes}</strong> ({nodePct}%)
            </>
          ) : (
            <strong>{currentNetwork.nodes}</strong>
          )}
        </span>
        <button
          className={`selection-badge-clear${selectedNodes.size > 0 ? " selection-badge-clear--nodes" : ""}`}
          onClick={clearSelectedNodes}
          aria-label="Deselect nodes"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="control-group">
        <span className="control-label">Edges:</span>
        <span className="selection-badge selection-badge--edges">
          {selectedEdges.size > 0 ? (
            <>
              <strong>{selectedEdges.size}</strong> of{" "}
              <strong>{currentNetwork.edges}</strong> ({edgePct}%)
            </>
          ) : (
            <strong>{currentNetwork.edges}</strong>
          )}
        </span>
        <button
          className={`selection-badge-clear${selectedEdges.size > 0 ? " selection-badge-clear--edges" : ""}`}
          onClick={clearSelectedEdges}
          aria-label="Deselect edges"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default NetworkInfo;
