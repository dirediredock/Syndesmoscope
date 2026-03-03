import { createContext, useContext, useState, useCallback, useMemo } from 'react'

/**
 * NetworkContext manages the currently loaded network data.
 *
 * Networks are precomputed and stored as JSON files. This context
 * handles loading and provides the data to all visualization panes.
 */

// Available precomputed networks (sourced from back_end/public/manifest.json, sorted by node count)
export const AVAILABLE_NETWORKS = [
  {
    id: 'example_graph',
    name: 'Toy Graph',
    description: '###',
    nodes: 7,
    edges: 10
  },
  {
    id: 'example_onion',
    name: 'Onion Graph',
    description: '###',
    nodes: 17,
    edges: 19
  },
  {
    id: 'desargues',
    name: 'Desargues',
    description: '###',
    nodes: 20,
    edges: 30
  },
  {
    id: 'dodecahedron',
    name: 'Dodecahedron',
    description: '###',
    nodes: 20,
    edges: 30
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
  {
    id: 'contigous_usa',
    name: 'US States',
    description: '###',
    nodes: 49,
    edges: 107
  },
  {
    id: 'fullerene_structures_C60',
    name: 'Buckyball',
    description: '###',
    nodes: 60,
    edges: 90
  },
  {
    id: 'dolphins',
    name: 'Dolphins',
    description: '###',
    nodes: 62,
    edges: 159
  },
  {
    id: 'blumenau_drug',
    name: 'Drug Trade',
    description: '###',
    nodes: 75,
    edges: 181
  },
  {
    id: 'les_miserables',
    name: 'Les Misérables',
    description: '###',
    nodes: 77,
    edges: 254
  },
  {
    id: 'game_thrones',
    name: 'Westeros',
    description: '###',
    nodes: 107,
    edges: 352
  },
  {
    id: 'tree_7_binomial',
    name: 'Binomial Tree',
    description: '###',
    nodes: 128,
    edges: 127
  },
  {
    id: 'ego_social_facebook_414',
    name: 'Ego 414',
    description: '###',
    nodes: 148,
    edges: 1692
  },
  {
    id: 'grid_14_by_14',
    name: 'Grid 14×14',
    description: '###',
    nodes: 196,
    edges: 364
  },
  {
    id: 'jazz_collab',
    name: 'Jazz Network',
    description: '###',
    nodes: 198,
    edges: 2742
  },
  {
    id: 'cintestinalis',
    name: 'Sea Squirt',
    description: '###',
    nodes: 205,
    edges: 2575
  },
  {
    id: 'fullerene_structures_C240',
    name: 'Fullerene 240',
    description: '###',
    nodes: 240,
    edges: 360
  },
  {
    id: 'malaria_genes_HVR5',
    name: 'Malaria HVR5',
    description: '###',
    nodes: 298,
    edges: 2684
  },
  {
    id: 'malaria_genes_HVR1',
    name: 'Malaria HVR1',
    description: '###',
    nodes: 307,
    edges: 2812
  },
  {
    id: 'facebook_friends',
    name: 'Facebook Friends',
    description: '###',
    nodes: 329,
    edges: 1954
  },
  {
    id: 'london_transport',
    name: 'London Tube',
    description: '###',
    nodes: 369,
    edges: 430
  },
  {
    id: 'netscience',
    name: 'Net Science',
    description: '###',
    nodes: 379,
    edges: 914
  },
  {
    id: 'sp_infectious',
    name: 'Expo Contacts',
    description: '###',
    nodes: 410,
    edges: 2765
  },
  {
    id: 'eu_airlines',
    name: 'EU Airlines',
    description: '###',
    nodes: 417,
    edges: 2953
  },
  {
    id: 'celegans_hermaphrodite_chemical',
    name: 'Herm Synaptic',
    description: '###',
    nodes: 446,
    edges: 4172
  },
  {
    id: 'celegans_metabolic',
    name: 'Worm Metabolic',
    description: '###',
    nodes: 453,
    edges: 2025
  },
  {
    id: 'celegans_hermaphrodite_gap_junction',
    name: 'Herm Electrical',
    description: '###',
    nodes: 460,
    edges: 1432
  },
  {
    id: 'physics_collab',
    name: 'Physics Collab',
    description: '###',
    nodes: 475,
    edges: 6426
  },
  {
    id: 'celegans_male_gap_junction',
    name: 'Male Electrical',
    description: '###',
    nodes: 484,
    edges: 1597
  },
  {
    id: 'stochastic_block_model',
    name: 'Block Model',
    description: '###',
    nodes: 500,
    edges: 42161
  },
  {
    id: 'ego_social_facebook_3437',
    name: 'Ego 3437',
    description: '###',
    nodes: 532,
    edges: 4812
  },
  {
    id: 'spanish_highschools',
    name: 'Spanish Schools',
    description: '###',
    nodes: 534,
    edges: 9527
  },
  {
    id: 'celegans_male_chemical',
    name: 'Male Synaptic',
    description: '###',
    nodes: 559,
    edges: 4500
  },
  {
    id: 'yeast_transcriptome',
    name: 'Yeast Gene',
    description: '###',
    nodes: 664,
    edges: 1065
  },
  {
    id: 'wiki_science',
    name: 'Wiki Science',
    description: '###',
    nodes: 677,
    edges: 6517
  },
  {
    id: 'fullerene_structures_C720',
    name: 'Fullerene 720',
    description: '###',
    nodes: 720,
    edges: 1080
  },
  {
    id: 'ego_social_facebook_1912',
    name: 'Ego 1912',
    description: '###',
    nodes: 744,
    edges: 30023
  },
  {
    id: 'internet_top_pop',
    name: 'Web Backbone',
    description: '###',
    nodes: 754,
    edges: 895
  },
  {
    id: 'plant_pol_kato',
    name: 'Kato Flowers',
    description: '###',
    nodes: 768,
    edges: 1205
  },
  {
    id: 'product_space',
    name: 'Product Space',
    description: '###',
    nodes: 866,
    edges: 2532
  },
  {
    id: 'fibonacci_sunflower',
    name: 'Sunflower',
    description: '###',
    nodes: 987,
    edges: 2924
  },
  {
    id: 'collins_yeast',
    name: 'Yeast Protein',
    description: '###',
    nodes: 1004,
    edges: 8319
  },
  {
    id: 'budapest_connectome',
    name: 'Human Brain',
    description: '###',
    nodes: 1015,
    edges: 70654
  },
  {
    id: 'ego_social_facebook_107',
    name: 'Ego 107',
    description: '###',
    nodes: 1034,
    edges: 26749
  },
  {
    id: 'euroroad',
    name: 'Euro Roads',
    description: '###',
    nodes: 1039,
    edges: 1305
  },
  {
    id: 'polblogs',
    name: 'Pol Blogs',
    description: '###',
    nodes: 1222,
    edges: 16714
  },
  {
    id: 'faa_routes',
    name: 'FAA Routes',
    description: '###',
    nodes: 1226,
    edges: 2408
  },
  {
    id: 'facebook_organizations',
    name: 'FB Pages',
    description: '###',
    nodes: 1429,
    edges: 19357
  },
  {
    id: 'barabasi_albert',
    name: 'Barabási-Albert',
    description: '###',
    nodes: 1500,
    edges: 23744
  },
  {
    id: 'erdos_renyi',
    name: 'Erdős-Rényi',
    description: '###',
    nodes: 1500,
    edges: 22512
  },
  {
    id: 'fullerene_structures_C1500',
    name: 'Fullerene 1500',
    description: '###',
    nodes: 1500,
    edges: 2250
  },
  {
    id: 'watts_strogatz',
    name: 'Watts-Strogatz',
    description: '###',
    nodes: 1500,
    edges: 24000
  },
  {
    id: 'bible_nouns',
    name: 'Bible Words',
    description: '###',
    nodes: 1707,
    edges: 9059
  },
  {
    id: 'urban_streets_venice',
    name: 'Venice Streets',
    description: '###',
    nodes: 1840,
    edges: 2397
  },
  {
    id: 'plant_pol_robertson',
    name: 'Robertson Flowers',
    description: '###',
    nodes: 1882,
    edges: 15254
  },
  {
    id: 'fullerene_structures_C2160',
    name: 'Fullerene 2160',
    description: '###',
    nodes: 2160,
    edges: 3240
  },
  {
    id: 'stanford_bunny',
    name: 'Stanford Bunny',
    description: '###',
    nodes: 2503,
    edges: 7048
  },
  {
    id: 'ten_friends',
    name: 'Ten Friends',
    description: '###',
    nodes: 2539,
    edges: 10455
  },
  {
    id: 'word_adjacency_japanese',
    name: 'Japanese Words',
    description: '###',
    nodes: 2698,
    edges: 7995
  },
  {
    id: 'drosophila_flybi',
    name: 'Fly Brain',
    description: '###',
    nodes: 2705,
    edges: 8458
  },
  {
    id: 'fly_larva',
    name: 'Larval Brain',
    description: '###',
    nodes: 2952,
    edges: 95990
  },
  {
    id: 'mist_genetic_worm',
    name: 'Worm Genome',
    description: '###',
    nodes: 3037,
    edges: 7914
  },
  {
    id: 'grid_56_by_56',
    name: 'Grid 56×56',
    description: '###',
    nodes: 3136,
    edges: 6160
  },
  {
    id: 'openflights',
    name: 'Open Flights',
    description: '###',
    nodes: 3188,
    edges: 18833
  },
  {
    id: 'mist_genetic_yeast',
    name: 'Yeast Genome',
    description: '###',
    nodes: 3536,
    edges: 51989
  },
  {
    id: 'mist_genetic_human',
    name: 'Human Genome',
    description: '###',
    nodes: 3570,
    edges: 8703
  },
  {
    id: 'mist_ppi_yeast',
    name: 'Yeast PPI',
    description: '###',
    nodes: 3592,
    edges: 14558
  },
  {
    id: 'bitcoin_alpha',
    name: 'Bitcoin Alpha',
    description: '###',
    nodes: 3775,
    edges: 14120
  },
  {
    id: 'mist_genetic_fly',
    name: 'Fly Genome',
    description: '###',
    nodes: 4055,
    edges: 13779
  },
  {
    id: 'power',
    name: 'Power Grid',
    description: '###',
    nodes: 4941,
    edges: 6594
  },
  {
    id: 'jung',
    name: 'JUNG',
    description: '###',
    nodes: 6120,
    edges: 50290
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
        fetch(`/${networkId}/${networkId}_NodeLink.json`).then(r => r.ok ? r.json() : null),
        fetch(`/${networkId}/${networkId}_CensusEdge.json`).then(r => r.ok ? r.json() : null),
        fetch(`/${networkId}/${networkId}_CensusNode.json`).then(r => r.ok ? r.json() : null),
        fetch(`/${networkId}/${networkId}_CensusStub.json`).then(r => r.ok ? r.json() : null),
        fetch(`/${networkId}/${networkId}_kSnakes.json`).then(r => r.ok ? r.json() : null),
        fetch(`/${networkId}/${networkId}_AdjacencyGrid.json`).then(r => r.ok ? r.json() : null),
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
