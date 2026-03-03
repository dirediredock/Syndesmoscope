import json

import networkx as nx

FILENAMES = [
    "barabasi_albert",
    "bible_nouns",
    "bitcoin_alpha",
    "blumenau_drug",
    "budapest_connectome",
    "celegans_hermaphrodite_chemical",
    "celegans_hermaphrodite_gap_junction",
    "celegans_male_chemical",
    "celegans_male_gap_junction",
    "celegans_metabolic",
    "cintestinalis",
    "collins_yeast",
    "contigous_usa",
    "desargues",
    "dodecahedron",
    "dolphins",
    "drosophila_flybi",
    "ego_social_facebook_107",
    "ego_social_facebook_1912",
    "ego_social_facebook_3437",
    "ego_social_facebook_414",
    "erdos_renyi",
    "eu_airlines",
    "euroroad",
    "example_graph",
    "example_onion",
    "faa_routes",
    "facebook_friends",
    "facebook_organizations",
    "fibonacci_sunflower",
    "fly_larva",
    "fullerene_structures_C1500",
    "fullerene_structures_C2160",
    "fullerene_structures_C240",
    "fullerene_structures_C60",
    "fullerene_structures_C720",
    "game_thrones",
    "grid_14_by_14",
    "grid_56_by_56",
    "internet_top_pop",
    "jazz_collab",
    "jung",
    "karate_club",
    "les_miserables",
    "london_transport",
    "malaria_genes_HVR1",
    "malaria_genes_HVR5",
    "mist_genetic_fly",
    "mist_genetic_human",
    "mist_genetic_worm",
    "mist_genetic_yeast",
    "mist_ppi_yeast",
    "netscience",
    "openflights",
    "physics_collab",
    "plant_pol_kato",
    "plant_pol_robertson",
    "polblogs",
    "power",
    "product_space",
    "sp_infectious",
    "spanish_highschools",
    "stanford_bunny",
    "stochastic_block_model",
    "ten_friends",
    "tree_7_binomial",
    "urban_streets_venice",
    "watts_strogatz",
    "wiki_science",
    "word_adjacency_japanese",
    "yeast_transcriptome",
    "zebras",
]


def load_JSON_as_G(json_filename):
    G = nx.Graph()
    E = []
    with open(json_filename, "r") as jsonfile:
        data = json.load(jsonfile)
        nodes = {n["node_idx"] for n in data.get("nodes", [])}
        for edge in data["edges"]:
            source = edge["source"]
            target = edge["target"]
            nodes.update([source, target])
            E.append((source, target))
    G.add_nodes_from(sorted(nodes))
    G.add_edges_from(E)
    return G, E


def BFS_Census(G):
    D = nx.to_dict_of_dicts(G)
    Census_Node = {}
    Census_Edge = {}
    Census_Stub = {}
    for source_node in D.keys():
        Q = [source_node]
        visited_nodes = set(Q)
        visited_edges = set()
        visited_stubs = set()
        vector_of_node_degrees = []
        vector_of_edge_degrees = []
        vector_of_stub_degrees = []
        while len(Q) > 0:
            node_degree = 0
            edge_degree = 0
            stub_degree = 0
            current_stubs = set()
            upcoming_nodes = []
            for node in Q:
                neighbors = D[node].keys()
                for neighbor in neighbors:
                    if neighbor not in visited_nodes:
                        upcoming_nodes.append(neighbor)
                        node_degree += 1
                    visited_nodes.add(neighbor)
                    edge = (min(node, neighbor), max(node, neighbor))
                    if edge not in visited_edges:
                        edge_degree += 1
                    visited_edges.add(edge)
                    stub = (node, neighbor)
                    if stub not in visited_stubs:
                        stub_degree += 1
                    current_stubs.add(stub)
                    visited_stubs.add(stub)
            for stub in current_stubs:
                visited_stubs.add((stub[1], stub[0]))
            vector_of_node_degrees.append(node_degree)
            vector_of_edge_degrees.append(edge_degree)
            vector_of_stub_degrees.append(stub_degree)
            Q = upcoming_nodes
        Census_Node[source_node] = vector_of_node_degrees
        Census_Edge[source_node] = vector_of_edge_degrees
        Census_Stub[source_node] = vector_of_stub_degrees
    return Census_Node, Census_Edge, Census_Stub
