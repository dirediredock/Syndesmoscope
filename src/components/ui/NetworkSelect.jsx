import { useEffect, useMemo } from "react";
import { useNetwork } from "../../contexts/NetworkContext";
import { useSelection } from "../../contexts/SelectionContext";
import { NETWORK_KINDS } from "../../contexts/NetworkContext";
import "./ControlPanel.css";

function NetworkSelect({ isPortrait }) {
  const { availableNetworks, currentNetworkId, isLoading, loadNetwork } =
    useNetwork();

  const { clearAllSelections } = useSelection();

  useEffect(() => {
    if (!currentNetworkId && availableNetworks.length > 0) {
      loadNetwork("les_miserables");
    }
  }, [availableNetworks, currentNetworkId, loadNetwork]);

  const handleNetworkChange = (e) => {
    const networkId = e.target.value;
    if (networkId) {
      clearAllSelections();
      loadNetwork(networkId);
    }
  };

  const groupedNetworks = useMemo(() => {
    const groups = new Map();
    for (const kind of NETWORK_KINDS) {
      groups.set(kind, []);
    }
    for (const network of availableNetworks) {
      const group = groups.get(network.kind);
      if (group) group.push(network);
    }
    return groups;
  }, [availableNetworks]);

  return (
    <div className="control-group">
      <label className="control-label" htmlFor="network-select">
        Dataset:
      </label>
      <select
        id="network-select"
        className="control-select"
        style={isPortrait ? { maxWidth: "20rem" } : undefined}
        value={currentNetworkId || ""}
        onChange={handleNetworkChange}
        disabled={isLoading}
        aria-label="Loaded Network Dataset"
        title="Loaded Network Dataset"
      >
        {NETWORK_KINDS.map((kind) => {
          const networks = groupedNetworks.get(kind);
          if (!networks || networks.length === 0) return null;
          return (
            <optgroup key={kind} label={kind}>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}

export default NetworkSelect;
