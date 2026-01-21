import { useEffect } from 'react'
import { useNetwork } from '../../contexts/NetworkContext'
import { useSelection } from '../../contexts/SelectionContext'
import './ControlPanel.css'

function ControlPanel() {
  const { 
    availableNetworks, 
    currentNetworkId, 
    currentNetwork,
    isLoading, 
    error,
    loadNetwork 
  } = useNetwork()
  
  const { 
    selectedNodes, 
    selectedEdges, 
    clearAllSelections 
  } = useSelection()

  useEffect(() => {
    if (!currentNetworkId && availableNetworks.length > 0) {
      loadNetwork('karate-club')
    }
  }, [availableNetworks, currentNetworkId, loadNetwork])

  const handleNetworkChange = (e) => {
    const networkId = e.target.value
    if (networkId) {
      clearAllSelections()
      loadNetwork(networkId)
    }
  }

  const hasSelections = selectedNodes.size > 0 || selectedEdges.size > 0

  return (
    <div className="control-panel">
      <div className="control-group">
        <label htmlFor="network-select" className="control-label">
          Loaded Network:
        </label>
        <select
          id="network-select"
          className="control-select"
          value={currentNetworkId || ''}
          onChange={handleNetworkChange}
          disabled={isLoading}
        >
          {/* <option value="">Available network datasets:</option> */}
          {availableNetworks.map(network => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
      </div>

      {currentNetwork && (
        <div className="control-info">
          <span className="info-stat">
            <span className="info-value">{currentNetwork.nodes}</span>
            <span className="info-label">nodes</span>
          </span>
          {/* <span className="info-divider"></span> */}
          <span className="info-stat">
            <span className="info-value">{currentNetwork.edges}</span>
            <span className="info-label">edges</span>
          </span>
        </div>
      )}

      {hasSelections && (
        <div className="control-group">
          <div className="selection-info">
            {selectedNodes.size > 0 && (
              <span className="selection-badge selection-badge--nodes">
                {selectedNodes.size} node{selectedNodes.size !== 1 ? 's' : ''}
              </span>
            )}
            {selectedEdges.size > 0 && (
              <span className="selection-badge selection-badge--edges">
                {selectedEdges.size} edge{selectedEdges.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button 
            className="control-button"
            onClick={clearAllSelections}
          >
            Clear
          </button>
        </div>
      )}

      {isLoading && (
        <div className="control-status">Loading...</div>
      )}

      {error && (
        <div className="control-error">{error}</div>
      )}
    </div>
  )
}

export default ControlPanel
