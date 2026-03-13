import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

/**
 * NetworkContext manages the currently loaded network data.
 *
 * Networks are precomputed and stored as JSON files. This context
 * handles loading and provides the data to all visualization panes.
 */

// Group ordering for the dataset dropdown (sorted by min node count in group)
export const NETWORK_KINDS = [
  "Examples",
  "Literary",
  "Geometric",
  "Ecological",
  "Social",
  "Infrastructure",
  "Neurological",
  "Biological",
  "Synthetic",
  "Technological",
];

// Available precomputed networks, grouped by kind (alphabetical by name within each group)
export const AVAILABLE_NETWORKS = [
  // ── Examples ──
  {
    id: "example_graph",
    name: "Example Graph",
    description: "###",
    nodes: 7,
    edges: 10,
    kind: "Examples",
  },
  {
    id: "example_onion",
    name: "Example Graph (Onion)",
    description: "###",
    nodes: 17,
    edges: 19,
    kind: "Examples",
  },
  {
    id: "tree_7_binomial",
    name: "Tree Graph (Binomial)",
    description: "###",
    nodes: 128,
    edges: 127,
    kind: "Examples",
  },
  {
    id: "grid_14_by_14",
    name: "Square Grid",
    description: "###",
    nodes: 196,
    edges: 364,
    kind: "Examples",
  },
  {
    id: "grid_56_by_56",
    name: "Square Grid [Large]",
    description: "###",
    nodes: 3136,
    edges: 6160,
    kind: "Examples",
  },
  // ── Literary ──

  {
    id: "les_miserables",
    name: "Les Misérables",
    description: "###",
    nodes: 77,
    edges: 254,
    kind: "Literary",
  },
  {
    id: "game_thrones",
    name: "Game of Thrones",
    description: "###",
    nodes: 107,
    edges: 352,
    kind: "Literary",
  },
  {
    id: "bible_nouns",
    name: "Bible Words",
    description: "###",
    nodes: 1707,
    edges: 9059,
    kind: "Literary",
  },
  {
    id: "word_adjacency_japanese",
    name: "Japanese Words",
    description: "###",
    nodes: 2698,
    edges: 7995,
    kind: "Literary",
  },
  {
    id: "wiki_science",
    name: "Wikipedia (Science Pages)",
    description: "###",
    nodes: 677,
    edges: 6517,
    kind: "Literary",
  },
  {
    id: "polblogs",
    name: "Political Blogs [Large]",
    description: "###",
    nodes: 1222,
    edges: 16714,
    kind: "Literary",
  },
  // ── Geometric ──
  {
    id: "desargues",
    name: "Desargues",
    description: "###",
    nodes: 20,
    edges: 30,
    kind: "Geometric",
  },
  {
    id: "dodecahedron",
    name: "Dodecahedron",
    description: "###",
    nodes: 20,
    edges: 30,
    kind: "Geometric",
  },
  {
    id: "fibonacci_sunflower",
    name: "Sunflower Seeds",
    description: "###",
    nodes: 987,
    edges: 2924,
    kind: "Geometric",
  },
  {
    id: "stanford_bunny",
    name: "Stanford Bunny",
    description: "###",
    nodes: 2503,
    edges: 7048,
    kind: "Geometric",
  },
  {
    id: "fullerene_structures_C60",
    name: "Fullerene (C60)",
    description: "###",
    nodes: 60,
    edges: 90,
    kind: "Geometric",
  },
  {
    id: "fullerene_structures_C240",
    name: "Fullerene (C240)",
    description: "###",
    nodes: 240,
    edges: 360,
    kind: "Geometric",
  },
  {
    id: "fullerene_structures_C720",
    name: "Fullerene (C720)",
    description: "###",
    nodes: 720,
    edges: 1080,
    kind: "Geometric",
  },
  {
    id: "fullerene_structures_C1500",
    name: "Fullerene (C1500)",
    description: "###",
    nodes: 1500,
    edges: 2250,
    kind: "Geometric",
  },
  {
    id: "fullerene_structures_C2160",
    name: "Fullerene (C2160)",
    description: "###",
    nodes: 2160,
    edges: 3240,
    kind: "Geometric",
  },
  // ── Ecological ──
  {
    id: "zebras",
    name: "Zebras",
    description: "###",
    nodes: 23,
    edges: 105,
    kind: "Ecological",
  },
  {
    id: "dolphins",
    name: "Dolphins",
    description: "###",
    nodes: 62,
    edges: 159,
    kind: "Ecological",
  },
  {
    id: "plant_pol_kato",
    name: "Plant Pollinators",
    description: "###",
    nodes: 768,
    edges: 1205,
    kind: "Ecological",
  },
  {
    id: "plant_pol_robertson",
    name: "Plant Pollinators [Large]",
    description: "###",
    nodes: 1882,
    edges: 15254,
    kind: "Ecological",
  },
  // ── Social ──
  {
    id: "karate_club",
    name: "Karate Club",
    description: "###",
    nodes: 34,
    edges: 78,
    kind: "Social",
  },
  {
    id: "jazz_collab",
    name: "Jazz Musicians",
    description: "###",
    nodes: 198,
    edges: 2742,
    kind: "Social",
  },
  {
    id: "physics_collab",
    name: "Authors (Physics)",
    description: "###",
    nodes: 475,
    edges: 6426,
    kind: "Social",
  },
  {
    id: "netscience",
    name: "Authors (Network Science)",
    description: "###",
    nodes: 379,
    edges: 914,
    kind: "Social",
  },
  {
    id: "spanish_highschools",
    name: "Social Network (Spanish Schools)",
    description: "###",
    nodes: 534,
    edges: 9527,
    kind: "Social",
  },
  {
    id: "ten_friends",
    name: "Social Network (Ten Friends) [Large]",
    description: "###",
    nodes: 2539,
    edges: 10455,
    kind: "Social",
  },
  {
    id: "ego_social_facebook_414",
    name: "Social Network (Facebook) [Tiny]",
    description: "###",
    nodes: 148,
    edges: 1692,
    kind: "Social",
  },
  {
    id: "facebook_friends",
    name: "Social Network (Facebook) [Small]",
    description: "###",
    nodes: 329,
    edges: 1954,
    kind: "Social",
  },
  {
    id: "ego_social_facebook_3437",
    name: "Social Network (Facebook) [Medium]",
    description: "###",
    nodes: 532,
    edges: 4812,
    kind: "Social",
  },
  {
    id: "ego_social_facebook_1912",
    name: "Social Network (Facebook) [Large]",
    description: "###",
    nodes: 744,
    edges: 30023,
    kind: "Social",
  },
  {
    id: "ego_social_facebook_107",
    name: "Social Network (Facebook) [Huge]",
    description: "###",
    nodes: 1034,
    edges: 26749,
    kind: "Social",
  },
  {
    id: "facebook_organizations",
    name: "Social Network (Facebook) [Massive]",
    description: "###",
    nodes: 1429,
    edges: 19357,
    kind: "Social",
  },

  // ── Infrastructure ──
  {
    id: "contigous_usa",
    name: "United States",
    description: "###",
    nodes: 49,
    edges: 107,
    kind: "Infrastructure",
  },
  {
    id: "london_transport",
    name: "London Underground",
    description: "###",
    nodes: 369,
    edges: 430,
    kind: "Infrastructure",
  },
  {
    id: "urban_streets_venice",
    name: "Venice Streets",
    description: "###",
    nodes: 1840,
    edges: 2397,
    kind: "Infrastructure",
  },
  {
    id: "euroroad",
    name: "European Roads",
    description: "###",
    nodes: 1039,
    edges: 1305,
    kind: "Infrastructure",
  },
  {
    id: "eu_airlines",
    name: "European Airlines",
    description: "###",
    nodes: 417,
    edges: 2953,
    kind: "Infrastructure",
  },
  {
    id: "faa_routes",
    name: "Flights",
    description: "###",
    nodes: 1226,
    edges: 2408,
    kind: "Infrastructure",
  },
  {
    id: "openflights",
    name: "Flights [Large]",
    description: "###",
    nodes: 3188,
    edges: 18833,
    kind: "Infrastructure",
  },
  {
    id: "power",
    name: "Western Power Grid [Large]",
    description: "###",
    nodes: 4941,
    edges: 6594,
    kind: "Infrastructure",
  },
  // ── Neurological ──
  {
    id: "cintestinalis",
    name: "Tunicate Synapses",
    description: "###",
    nodes: 205,
    edges: 2575,
    kind: "Neurological",
  },
  {
    id: "celegans_metabolic",
    name: "Nematode Metabolism",
    description: "###",
    nodes: 453,
    edges: 2025,
    kind: "Neurological",
  },
  {
    id: "celegans_hermaphrodite_gap_junction",
    name: "Nematode Synapses (H)",
    description: "###",
    nodes: 460,
    edges: 1432,
    kind: "Neurological",
  },
  {
    id: "celegans_male_gap_junction",
    name: "Nematode Synapses (M)",
    description: "###",
    nodes: 484,
    edges: 1597,
    kind: "Neurological",
  },
  {
    id: "celegans_hermaphrodite_chemical",
    name: "Nematode Biochemical (H)",
    description: "###",
    nodes: 446,
    edges: 4172,
    kind: "Neurological",
  },
  {
    id: "celegans_male_chemical",
    name: "Nematode Biochemical (M)",
    description: "###",
    nodes: 559,
    edges: 4500,
    kind: "Neurological",
  },
  {
    id: "fly_larva",
    name: "Fruitfly Brain [Massive]",
    description: "###",
    nodes: 2952,
    edges: 95990,
    kind: "Neurological",
  },
  {
    id: "budapest_connectome",
    name: "Human Brain [Massive]",
    description: "###",
    nodes: 1015,
    edges: 70654,
    kind: "Neurological",
  },
  // ── Biological ──
  {
    id: "blumenau_drug",
    name: "Drug Interactions",
    description: "###",
    nodes: 75,
    edges: 181,
    kind: "Biological",
  },
  {
    id: "sp_infectious",
    name: "Infectious Contacts",
    description: "###",
    nodes: 410,
    edges: 2765,
    kind: "Biological",
  },
  {
    id: "mist_genetic_human",
    name: "Human Genome",
    description: "###",
    nodes: 3570,
    edges: 8703,
    kind: "Biological",
  },
  {
    id: "mist_genetic_worm",
    name: "Nematode Genome",
    description: "###",
    nodes: 3037,
    edges: 7914,
    kind: "Biological",
  },
  {
    id: "drosophila_flybi",
    name: "Fruitfly Proteome",
    description: "###",
    nodes: 2705,
    edges: 8458,
    kind: "Biological",
  },
  {
    id: "mist_genetic_fly",
    name: "Fruitfly Genome [Large]",
    description: "###",
    nodes: 4055,
    edges: 13779,
    kind: "Biological",
  },
  {
    id: "malaria_genes_HVR1",
    name: "Malaria Genome (HVR1)",
    description: "###",
    nodes: 307,
    edges: 2812,
    kind: "Biological",
  },
  {
    id: "malaria_genes_HVR5",
    name: "Malaria Genome (HVR5)",
    description: "###",
    nodes: 298,
    edges: 2684,
    kind: "Biological",
  },
  {
    id: "collins_yeast",
    name: "Yeast Proteome",
    description: "###",
    nodes: 1004,
    edges: 8319,
    kind: "Biological",
  },
  {
    id: "yeast_transcriptome",
    name: "Yeast Genome",
    description: "###",
    nodes: 664,
    edges: 1065,
    kind: "Biological",
  },
  {
    id: "mist_ppi_yeast",
    name: "Yeast Proteome [Large]",
    description: "###",
    nodes: 3592,
    edges: 14558,
    kind: "Biological",
  },
  {
    id: "mist_genetic_yeast",
    name: "Yeast Genome [Massive]",
    description: "###",
    nodes: 3536,
    edges: 51989,
    kind: "Biological",
  },
  // ── Synthetic ──
  {
    id: "erdos_renyi",
    name: "Erdos-Renyi [Large]",
    description: "###",
    nodes: 1500,
    edges: 22512,
    kind: "Synthetic",
  },
  {
    id: "barabasi_albert",
    name: "Barabasi-Albert [Large]",
    description: "###",
    nodes: 1500,
    edges: 23744,
    kind: "Synthetic",
  },
  {
    id: "watts_strogatz",
    name: "Watts-Strogatz [Large]",
    description: "###",
    nodes: 1500,
    edges: 24000,
    kind: "Synthetic",
  },
  {
    id: "stochastic_block_model",
    name: "Stochastic Block Model [Large]",
    description: "###",
    nodes: 500,
    edges: 42161,
    kind: "Synthetic",
  },
  // ── Technological ──
  {
    id: "product_space",
    name: "Product Exports",
    description: "###",
    nodes: 866,
    edges: 2532,
    kind: "Technological",
  },
  {
    id: "internet_top_pop",
    name: "Internet Backbone",
    description: "###",
    nodes: 754,
    edges: 895,
    kind: "Technological",
  },
  {
    id: "bitcoin_alpha",
    name: "Bitcoin [Large]",
    description: "###",
    nodes: 3775,
    edges: 14120,
    kind: "Technological",
  },
  {
    id: "jung",
    name: "Software Dependencies [Massive]",
    description: "###",
    nodes: 6120,
    edges: 50290,
    kind: "Technological",
  },
];

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [currentNetworkId, setCurrentNetworkId] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current network metadata
  const currentNetwork = useMemo(() => {
    return AVAILABLE_NETWORKS.find((n) => n.id === currentNetworkId) || null;
  }, [currentNetworkId]);

  // Load a network's data
  const loadNetwork = useCallback(
    async (networkId) => {
      if (networkId === currentNetworkId && networkData) {
        return; // Already loaded
      }

      setIsLoading(true);
      setError(null);

      try {
        // Load all visualization data files for this network
        const [
          nodeLink,
          censusEdge,
          censusNode,
          censusStub,
          kSnakes,
          adjacencyMatrix,
        ] = await Promise.all([
          fetch(`/${networkId}/${networkId}_NodeLink.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(`/${networkId}/${networkId}_CensusEdge.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(`/${networkId}/${networkId}_CensusNode.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(`/${networkId}/${networkId}_CensusStub.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(`/${networkId}/${networkId}_kSnakes.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(`/${networkId}/${networkId}_AdjacencyMatrix.json`).then((r) =>
            r.ok ? r.json() : null,
          ),
        ]);

        setNetworkData({
          nodeLink,
          censusEdge,
          censusNode,
          censusStub,
          kSnakes,
          adjacencyMatrix,
        });
        setCurrentNetworkId(networkId);
      } catch (err) {
        console.error("Failed to load network:", err);
        setError(err.message || "Failed to load network data");
        setNetworkData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetworkId, networkData],
  );

  // Clear loaded network
  const clearNetwork = useCallback(() => {
    setCurrentNetworkId(null);
    setNetworkData(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
      currentNetworkId,
      currentNetwork,
      networkData,
      isLoading,
      error,
      loadNetwork,
      clearNetwork,
    ],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
