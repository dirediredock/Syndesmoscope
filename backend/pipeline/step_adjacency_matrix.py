import json
import os

import networkx as nx
import numpy as np
from scipy.sparse import csgraph

from .graph_loader import load_JSON_as_G


def compute_fiedler_ordering(G):
    adj_matrix = nx.adjacency_matrix(G)
    laplacian = csgraph.laplacian(adj_matrix, normed=False)
    eigenvals, eigenvecs = np.linalg.eigh(laplacian.toarray())
    fiedler_vector = eigenvecs[:, 1]
    node_list = list(G.nodes())
    fiedler_ordering = np.argsort(fiedler_vector)
    return [node_list[i] for i in fiedler_ordering]


def run(filename, scratch_dir, public_dir):
    G, _ = load_JSON_as_G(os.path.join(scratch_dir, f"{filename}.json"))

    ordered_nodes = compute_fiedler_ordering(G)

    seriation_map = {node: idx for idx, node in enumerate(ordered_nodes)}

    node_count = len(ordered_nodes)
    padding = 0.05 * node_count

    edges_data = []
    for edge_idx, (source, target) in enumerate(G.edges()):
        pos_source = seriation_map[source]
        pos_target = seriation_map[target]
        sorted_positions = sorted([pos_source, pos_target])

        edges_data.append(
            {
                "edge_idx": edge_idx,
                "source_node_idx": source,
                "target_node_idx": target,
                "x": sorted_positions[0],
                "y": sorted_positions[1],
                "triangle": "upper",
            }
        )

        edges_data.append(
            {
                "edge_idx": edge_idx,
                "source_node_idx": source,
                "target_node_idx": target,
                "x": sorted_positions[1],
                "y": sorted_positions[0],
                "triangle": "lower",
            }
        )

    gridlines_data = []
    for node_idx in G.nodes():
        seriated_pos = seriation_map[node_idx]
        gridlines_data.append(
            {
                "node_idx": node_idx,
                "seriated_position": seriated_pos,
                "row_x_start": 0 - padding,
                "row_x_end": node_count + padding,
                "col_y_start": 0 - padding,
                "col_y_end": node_count + padding,
            }
        )

    json_data = {
        "metadata": {
            "filename": filename,
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
        },
        "edges": edges_data,
        "node_gridlines": gridlines_data,
        "seriation_order": ordered_nodes,
    }

    out_dir = os.path.join(public_dir, filename)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, f"{filename}_AdjacencyMatrix.json"), "w") as f:
        json.dump(json_data, f, indent=2)
