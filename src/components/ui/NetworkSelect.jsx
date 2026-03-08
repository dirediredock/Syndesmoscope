import { useEffect } from "react";
import { useNetwork } from "../../contexts/NetworkContext";
import { useSelection } from "../../contexts/SelectionContext";
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
        {availableNetworks.map((network) => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default NetworkSelect;
