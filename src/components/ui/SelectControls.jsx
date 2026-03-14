import { useCallback, useMemo } from "react";
import { useSelection } from "../../contexts/SelectionContext";
import { useNetwork } from "../../contexts/NetworkContext";
import BrushIcon from "./BrushIcon";
import "./ControlPanel.css";

function SelectControls() {
  const {
    selectedNodes,
    selectedEdges,
    selectNodes,
    selectEdges,
    brushMode,
    setBrushMode,
  } = useSelection();
  const { networkData } = useNetwork();

  const handleAssociatedNodes = useCallback(() => {
    if (!networkData?.adjacencyMatrix || selectedEdges.size === 0) return;
    const nodeIdxs = new Set();
    networkData.adjacencyMatrix.edges
      .filter((e) => selectedEdges.has(e.edge_idx))
      .forEach((e) => {
        nodeIdxs.add(e.source_node_idx);
        nodeIdxs.add(e.target_node_idx);
      });
    selectNodes([...nodeIdxs]);
  }, [networkData, selectedEdges, selectNodes]);

  const handleAssociatedEdges = useCallback(() => {
    if (!networkData?.adjacencyMatrix || selectedNodes.size === 0) return;
    const edgeIdxs = networkData.adjacencyMatrix.edges
      .filter(
        (e) =>
          selectedNodes.has(e.source_node_idx) &&
          selectedNodes.has(e.target_node_idx),
      )
      .map((e) => e.edge_idx);
    selectEdges(edgeIdxs);
  }, [networkData, selectedNodes, selectEdges]);

  const hasAssocNodes = useMemo(() => {
    if (!networkData?.adjacencyMatrix || selectedEdges.size === 0) return false;
    return networkData.adjacencyMatrix.edges.some(
      (e) =>
        selectedEdges.has(e.edge_idx) &&
        (!selectedNodes.has(e.source_node_idx) ||
          !selectedNodes.has(e.target_node_idx)),
    );
  }, [networkData, selectedEdges, selectedNodes]);

  const hasAssocEdges = useMemo(() => {
    if (!networkData?.adjacencyMatrix || selectedNodes.size === 0) return false;
    return networkData.adjacencyMatrix.edges.some(
      (e) =>
        !selectedEdges.has(e.edge_idx) &&
        selectedNodes.has(e.source_node_idx) &&
        selectedNodes.has(e.target_node_idx),
    );
  }, [networkData, selectedNodes, selectedEdges]);

  return (
    <div className="control-group">
      <span className="control-label">Select:</span>
      <div className="control-btn-wrap">
        <button
          className={`control-icon-btn${brushMode ? " control-icon-btn--brush" : " control-icon-btn--off"}`}
          onClick={() => setBrushMode((b) => !b)}
          aria-label="Brush"
          title="Brush"
        >
          <BrushIcon />
        </button>
      </div>
      <div className="control-btn-wrap">
        <button
          className={`control-icon-btn${hasAssocNodes ? " control-icon-btn--nodes" : " control-icon-btn--off"}`}
          onClick={handleAssociatedNodes}
          disabled={!hasAssocNodes}
          aria-label="Associated Nodes"
          title="Associated Nodes"
        >
          <svg width="14" height="14" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="control-btn-wrap">
        <button
          className={`control-icon-btn${hasAssocEdges ? " control-icon-btn--edges" : " control-icon-btn--off"}`}
          onClick={handleAssociatedEdges}
          disabled={!hasAssocEdges}
          aria-label="Associated Edges"
          title="Associated Edges"
        >
          <svg width="14" height="14" viewBox="-0.5 0 10 10">
            <line
              x1="1.5"
              y1="7"
              x2="6.5"
              y2="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="1.5" cy="7" r="2" fill="currentColor" />
            <circle cx="6.5" cy="2" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SelectControls;
