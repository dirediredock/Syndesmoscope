import json
import os
import random

import networkx as nx
import numpy as np

from .graph_loader import BFS_Census, load_JSON_as_G


def G_deepscramble(G, seed=None):
    H = nx.Graph()
    nodes = list(G.nodes())
    shuffled = list(range(len(nodes)))
    random.seed(seed)
    random.shuffle(shuffled)
    label_map = {old: new for old, new in zip(nodes, shuffled)}
    for new_label in sorted(label_map.values()):
        H.add_node(new_label)
    new_edges = sorted((label_map[u], label_map[v]) for u, v in G.edges())
    for u, v in new_edges:
        H.add_edge(u, v)
    return H


def G_census_anchor(H):
    I = nx.Graph()
    nodes = list(H.nodes())
    _, _, Census_Stub = BFS_Census(H)
    max_len = max(len(Census_Stub[n]) for n in nodes)
    padded = {n: Census_Stub[n] + [0] * (max_len - len(Census_Stub[n])) for n in nodes}
    sorted_nodes = sorted(nodes, key=lambda n: padded[n])
    label_map = {old: new for new, old in enumerate(sorted_nodes)}
    for new_label in sorted(label_map.values()):
        I.add_node(new_label)
    new_edges = sorted((label_map[u], label_map[v]) for u, v in H.edges())
    for u, v in new_edges:
        I.add_edge(u, v)
    return I


def export_JSON(G, filename):
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
    return {
        "metadata": {
            "name": filename,
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
        },
        "nodes": nodes,
        "edges": edges,
    }


def run(filename, input_dir, scratch_dir):
    G, _ = load_JSON_as_G(os.path.join(input_dir, f"{filename}.json"))

    seed = np.random.randint(100000, 1000000)
    G_scrambled = G_deepscramble(G, seed=seed)
    G_anchored = G_census_anchor(G_scrambled)

    JSON_data = export_JSON(G_anchored, filename)

    os.makedirs(scratch_dir, exist_ok=True)
    out_path = os.path.join(scratch_dir, f"{filename}.json")
    with open(out_path, "w") as f:
        json.dump(JSON_data, f, indent=2)

    return JSON_data
