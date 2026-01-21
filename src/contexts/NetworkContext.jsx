import { createContext, useContext, useState, useCallback, useMemo } from 'react'

/**
 * NetworkContext manages the currently loaded network data.
 * 
 * Networks are precomputed and stored as JSON files. This context
 * handles loading and provides the data to all visualization panes.
 */

// Available precomputed networks (MVP set)
export const AVAILABLE_NETWORKS = [
  {
    id: 'karate-club',
    name: 'Karate Club',
    description: "###",
    nodes: 34,
    edges: 78
  },
  {
    id: 'les-miserables',
    name: 'Les Misérables',
    description: "###",
    nodes: 77,
    edges: 254
  },
  {
    id: 'game-thrones',
    name: 'Game of Thrones',
    description: "###",
    nodes: 107,
    edges: 352
  },
  {
    id: 'tree-7-binomial',
    name: 'Binomial Tree',
    description: "###",
    nodes: 128,
    edges: 127
  },
  {
    id: 'grid-14-by-14',
    name: 'Square Grid',
    description: "###",
    nodes: 196,
    edges: 364
  },
  {
    id: 'network-science',
    name: 'Network Science',
    description: '###',
    nodes: 379,
    edges: 914
  },
  {
    id: 'fibonacci-sunflower',
    name: 'Fibonacci Sunflower',
    description: '###',
    nodes: 987,
    edges: 2924
  },
  {
    id: 'polblogs',
    name: 'Political Blogs',
    description: "###",
    nodes: 1222,
    edges: 16714
  },
  {
    id: 'stanford-bunny',
    name: 'Stanford Bunny',
    description: "###",
    nodes: 2503,
    edges: 7048
  },

]

const NetworkContext = createContext(null)

export function NetworkProvider({ children }) {
  const [currentNetworkId, setCurrentNetworkId] = useState(null)
  const [networkData, setNetworkData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get current network metadata
  const currentNetwork = useMemo(() => {
    return AVAILABLE_NETWORKS.find(n => n.id === currentNetworkId) || null
  }, [currentNetworkId])

  // Load a network's data
  const loadNetwork = useCallback(async (networkId) => {
    if (networkId === currentNetworkId && networkData) {
      return // Already loaded
    }

    setIsLoading(true)
    setError(null)

    try {
      // Load all visualization data files for this network
      // In production, these would be fetched from /data/{networkId}/
      const [nodeLink, hopCensus, kSnakes] = await Promise.all([
        fetch(`/data/${networkId}/nodelink.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/hopcensus.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/ksnakes.json`).then(r => r.ok ? r.json() : null),
      ])

      setNetworkData({
        nodeLink,
        // hopCensus,
        kSnakes,
        // Future: adjacencyMatrix, censusCensus, graphPrism
      })
      setCurrentNetworkId(networkId)
    } catch (err) {
      console.error('Failed to load network:', err)
      setError(err.message || 'Failed to load network data')
      setNetworkData(null)
    } finally {
      setIsLoading(false)
    }
  }, [currentNetworkId, networkData])

  // Clear loaded network
  const clearNetwork = useCallback(() => {
    setCurrentNetworkId(null)
    setNetworkData(null)
    setError(null)
  }, [])

  const value = useMemo(() => ({
    // Available networks
    availableNetworks: AVAILABLE_NETWORKS,
    
    // Current state
    currentNetworkId,
    currentNetwork,
    networkData,
    isLoading,
    error,
    
    // Actions
    loadNetwork,
    clearNetwork,
  }), [
    currentNetworkId,
    currentNetwork,
    networkData,
    isLoading,
    error,
    loadNetwork,
    clearNetwork
  ])

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}
