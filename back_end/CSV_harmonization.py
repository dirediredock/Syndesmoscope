import json
import os

import matplotlib.pyplot as plt
import networkx as nx
import pandas as pd
import random

os.chdir(os.path.dirname(os.path.abspath(__file__)))

###############################################################################

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


def create_G(edgelist):
    G = nx.Graph()
    G.add_edges_from(edgelist)
    G.remove_edges_from(nx.selfloop_edges(G))
    G = nx.Graph(G)
    if nx.is_connected(G):
        largest_cc = G
    else:
        largest_cc = G.subgraph(
            max(
                nx.connected_components(G),
                key=len,
            )
        ).copy()
    G = largest_cc
    return G


def isomorphic_randomization(edgelist):
    unique_nodes = list(set(node for edge in edgelist for node in edge))
    new_ids = list(range(len(unique_nodes)))
    random.shuffle(new_ids)
    mapping = dict(zip(unique_nodes, new_ids))
    result = [(mapping[src], mapping[tgt]) for src, tgt in edgelist]
    random.shuffle(result)
    return result


def plot_nodelink(G, filename):
    fig, ax = plt.subplots(figsize=(8, 8))
    fig.canvas.manager.set_window_title(filename)
    G_pos = nx.spring_layout(G)
    for source, target in G.edges():
        x = [G_pos[source][0], G_pos[target][0]]
        y = [G_pos[source][1], G_pos[target][1]]
        ax.plot(x, y, color="k", linewidth=0.1, alpha=1)
    node_x = [G_pos[node][0] for node in G.nodes()]
    node_y = [G_pos[node][1] for node in G.nodes()]
    ax.scatter(node_x, node_y, c="lightblue", s=20, alpha=0.5)
    ax.axis("off")
    plt.show()


def export_json(G, filename):
    node_id_to_idx = {node: idx for idx, node in enumerate(G.nodes())}
    nodes = []
    for node_id, node_idx in node_id_to_idx.items():
        nodes.append(
            {
                "node_idx": node_idx,
                "degree": G.degree(node_id),
            }
        )
    edges = []
    for edge_idx, (source, target) in enumerate(G.edges()):
        edges.append(
            {
                "edge_idx": edge_idx,
                "source": node_id_to_idx[source],
                "target": node_id_to_idx[target],
            }
        )
    data = {
        "metadata": {
            "name": filename,
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
        },
        "nodes": nodes,
        "edges": edges,
    }
    output_path = f"input/{graph_name}.json"
    with open(output_path, "w") as json_file:
        json.dump(data, json_file, indent=2)

    print(f"{filename}\n............................................... DONE!")


###############################################################################

graph_name = "drosophila_flybi"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "london_transport"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fullerene_structures_C60"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fullerene_structures_C240"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fullerene_structures_C720"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fullerene_structures_C1500"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fullerene_structures_C2160"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "grid_14_by_14"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "celegans_male_gap_junction"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "les_miserables"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "game_thrones"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "jazz_collab"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "karate_club"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "netscience"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "dolphins"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "zebras"

edgelist = []

with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "example_graph"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "example_onion"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "desargues"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "dodecahedron"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "tree_7_binomial"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "stochastic_block_model"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fibonacci_sunflower"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "barabasi_albert"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "erdos_renyi"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "watts_strogatz"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "stanford_bunny"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "ten_friends"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "grid_56_by_56"

edgelist = []
with open(
    f"CSV_source/source_Oddo2024/{graph_name}/topology.csv",
    "r",
) as CSV_file:
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "contigous_usa"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "blumenau_drug"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _, _, _, _, _, _, _, _, _, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "celegans_hermaphrodite_chemical"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "celegans_hermaphrodite_gap_junction"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "celegans_male_chemical"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "yeast_transcriptome"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "sp_infectious"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "budapest_connectome"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _, _, _, _, _, _, _, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "ego_social_facebook_414"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "ego_social_facebook_3437"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "ego_social_facebook_1912"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "ego_social_facebook_107"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "bitcoin_alpha"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "word_adjacency_japanese"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "urban_streets_venice"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "plant_pol_kato"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "plant_pol_robertson"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "bible_nouns"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "celegans_metabolic"

edgelist = []
with open(
    f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv",
    "r",
) as CSV_file:
    next(CSV_file)
    for row in CSV_file:
        node_source, node_target, _, _ = row.strip().split(",")
        edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "euroroad"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)


###############################################################################

graph_name = "power"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "wiki_science"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "polblogs"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "malaria_genes_HVR1"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "malaria_genes_HVR5"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "spanish_highschools"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "internet_top_pop"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "eu_airlines"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "facebook_organizations"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "facebook_friends"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "mist_genetic_worm"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "mist_genetic_yeast"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "mist_ppi_yeast"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "mist_genetic_human"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "mist_genetic_fly"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "cintestinalis"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "physics_collab"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "product_space"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "faa_routes"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "collins_yeast"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "fly_larva"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "openflights"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################

graph_name = "jung"

edgelist = []
df = pd.read_csv(f"CSV_source/source_Netzschleuder/{graph_name}/network.csv/edges.csv")
for _, row in df.iterrows():
    node_source = str(row.iloc[0])
    node_target = str(row.iloc[1])
    edgelist.append((node_source, node_target))

edgelist_deepscramble = isomorphic_randomization(edgelist)

G = create_G(edgelist_deepscramble)

# plot_nodelink(G, graph_name)
export_json(G, graph_name)

###############################################################################
