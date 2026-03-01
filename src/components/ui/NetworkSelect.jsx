import { useEffect } from 'react'
import { useNetwork } from '../../contexts/NetworkContext'
import { useSelection } from '../../contexts/SelectionContext'
import './ControlPanel.css'

function NetworkSelect() {
  const {
    availableNetworks,
    currentNetworkId,
    isLoading,
    error,
    loadNetwork
  } = useNetwork()

  const { clearAllSelections } = useSelection()

  useEffect(() => {
    if (!currentNetworkId && availableNetworks.length > 0) {
      loadNetwork('game_thrones')
    }
  }, [availableNetworks, currentNetworkId, loadNetwork])

  const handleNetworkChange = (e) => {
    const networkId = e.target.value
    if (networkId) {
      clearAllSelections()
      loadNetwork(networkId)
    }
  }

  return (
    <>
      {error && (
        <div className="control-error">{error}</div>
      )}
      <div className="control-group">
        <label className="control-label" htmlFor="network-select">Dataset:</label>
        <select
          id="network-select"
          className="control-select"
          value={currentNetworkId || ''}
          onChange={handleNetworkChange}
          disabled={isLoading}
          aria-label="Loaded Network Dataset"
          title="Loaded Network Dataset"
        >
          {availableNetworks.map(network => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="control-status">Loading...</div>
        )}
      </div>
    </>
  )
}

export default NetworkSelect
