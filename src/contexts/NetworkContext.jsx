import { createContext, useContext, useState, useCallback, useMemo } from 'react'

/**
 * NetworkContext manages the currently loaded network data.
 *
 * Networks are precomputed and stored as JSON files. This context
 * handles loading and provides the data to all visualization panes.
 */

// Available precomputed networks
export const AVAILABLE_NETWORKS = [
  {
    id: 'example_graph',
    name: 'Example Graph 1',
    description: '###',
    nodes: 7,
    edges: 10
  },
  {
    id: 'example_onion',
    name: 'Example Graph 2',
    description: '###',
    nodes: 17,
    edges: 19
  },
  {
    id: 'zebras',
    name: 'Zebras',
    description: '###',
    nodes: 23,
    edges: 105
  },
  {
    id: 'karate_club',
    name: 'Karate Club',
    description: '###',
    nodes: 34,
    edges: 78
  },
  // {
  //   id: 'karate_club_outer_duo',
  //   name: 'Karate Club (Pair Periphery Join)',
  //   description: '###',
  //   nodes: 67,
  //   edges: 156
  // },
  {
    id: 'dolphins',
    name: 'Dolphins',
    description: '###',
    nodes: 62,
    edges: 159
  },
  // {
  //   id: 'blumenau_drug',
  //   name: 'Drug Interactions',
  //   description: '###',
  //   nodes: 75,
  //   edges: 181
  // },
  {
    id: 'les_miserables',
    name: 'Les Miserables',
    description: '###',
    nodes: 77,
    edges: 254
  },
  // {
  //   id: 'les_miserables_outer_duo',
  //   name: 'Les Miserables (Pair Periphery Join)',
  //   description: '###',
  //   nodes: 153,
  //   edges: 508
  // },
  // {
  //   id: 'les_miserables_outer_trio',
  //   name: 'Les Miserables (Trio Periphery Join)',
  //   description: '###',
  //   nodes: 229,
  //   edges: 762
  // },
  // {
  //   id: 'les_miserables_inner_duo',
  //   name: 'Les Miserables (Pair Core Join)',
  //   description: '###',
  //   nodes: 142,
  //   edges: 446
  // },
  // {
  //   id: 'les_miserables_inner_trio',
  //   name: 'Les Miserables (Trio Core Join)',
  //   description: '###',
  //   nodes: 207,
  //   edges: 638
  // },
  {
    id: 'game_thrones',
    name: 'Game of Thrones',
    description: '###',
    nodes: 107,
    edges: 352
  },
  // {
  //   id: 'ego_social_facebook_414',
  //   name: 'Social Network 1',
  //   description: '###',
  //   nodes: 148,
  //   edges: 1692
  // },
  {
    id: 'grid_14_by_14',
    name: 'Square Grid',
    description: '###',
    nodes: 196,
    edges: 364
  },
  {
    id: 'jazz_collab',
    name: 'Jazz Collaboration',
    description: '###',
    nodes: 198,
    edges: 2742
  },
  // {
  //   id: 'cintestinalis',
  //   name: 'Tadpole Brain',
  //   description: '###',
  //   nodes: 205,
  //   edges: 2575
  // },
  // {
  //   id: 'malaria_genes_HVR1',
  //   name: 'Malaria Genes',
  //   description: '###',
  //   nodes: 307,
  //   edges: 2812
  // },
  {
    id: 'fullerene_structures_C240',
    name: 'Fullerene Molecule',
    description: '###',
    nodes: 329,
    edges: 1954
  },
  {
    id: 'fullerene_structures_C720',
    name: 'Fullerene Molecule (C720)',
    description: '###',
    nodes: 720,
    edges: 1080
  },
  {
    id: 'london_transport',
    name: 'London Underground',
    description: '###',
    nodes: 369,
    edges: 430
  },
  {
    id: 'sp_infectious',
    name: 'Infectious Expo',
    description: '###',
    nodes: 410,
    edges: 2765
  },
  // {
  //   id: 'celegans_metabolic',
  //   name: 'Roundworm Metabolic Map',
  //   description: '###',
  //   nodes: 453,
  //   edges: 2025
  // },
  // {
  //   id: 'physics_collab',
  //   name: 'Physics Collaboration',
  //   description: '###',
  //   nodes: 475,
  //   edges: 6426
  // },
  // {
  //   id: 'celegans_male_gap_junction',
  //   name: 'Roundworm Neural Map',
  //   description: '###',
  //   nodes: 484,
  //   edges: 1597
  // },
  {
    id: 'wiki_science',
    name: 'Wikipedia Science Pages',
    description: '###',
    nodes: 677,
    edges: 6517
  },
  // {
  //   id: 'budapest_connectome',
  //   name: 'Human Brain',
  //   description: '###',
  //   nodes: 1015,
  //   edges: 70654
  // },
  {
    id: 'polblogs',
    name: 'Political Blogs',
    description: '###',
    nodes: 1222,
    edges: 16714
  },
  {
    id: 'plant_pol_robertson',
    name: 'Plant and Pollinators',
    description: '###',
    nodes: 1882,
    edges: 15254
  },
  // {
  //   id: 'barabasi_albert',
  //   name: 'Barabasi-Albert',
  //   description: '###',
  //   nodes: 1500,
  //   edges: 23744
  // },
  // {
  //   id: 'erdos_renyi',
  //   name: 'Erdos-Renyi',
  //   description: '###',
  //   nodes: 1500,
  //   edges: 22512
  // },
  // {
  //   id: 'watts_strogatz',
  //   name: 'Watts-Strogatz',
  //   description: '###',
  //   nodes: 1500,
  //   edges: 24000
  // },
  // {
  //   id: 'ten_friends',
  //   name: 'Social Network 3',
  //   description: '###',
  //   nodes: 2539,
  //   edges: 10455
  // },
  {
    id: 'word_adjacency_japanese',
    name: 'Japanese Words',
    description: '###',
    nodes: 2698,
    edges: 7995
  },
  {
    id: 'mist_genetic_human',
    name: 'Human Genome',
    description: '###',
    nodes: 3570,
    edges: 8703
  },
  {
    id: 'bitcoin_alpha',
    name: 'Bitcoin',
    description: '###',
    nodes: 3775,
    edges: 14120
  },
  {
    id: 'power',
    name: 'Western Power Grid',
    description: '###',
    nodes: 4941,
    edges: 6594
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
      const [nodeLink, 
        censusEdge, 
        censusNode, 
        censusStub, 
        kSnakes, 
        adjacencyGrid
      ] = await Promise.all([
        fetch(`/data/${networkId}/${networkId}_NodeLink.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/${networkId}_CensusEdge.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/${networkId}_CensusNode.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/${networkId}_CensusStub.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/${networkId}_kSnakes.json`).then(r => r.ok ? r.json() : null),
        fetch(`/data/${networkId}/${networkId}_AdjacencyGrid.json`).then(r => r.ok ? r.json() : null),
      ])

      setNetworkData({
        nodeLink,
        censusEdge,
        censusNode,
        censusStub,
        kSnakes,
        adjacencyGrid,
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
