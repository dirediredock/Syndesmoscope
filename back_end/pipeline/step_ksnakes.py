import json
import os

import networkx as nx
import pandas as pd

from .graph_loader import load_JSON_as_G


def run(filename, scratch_dir, public_dir):
    G, _ = load_JSON_as_G(os.path.join(scratch_dir, f"{filename}.json"))

    kCore_values = nx.core_number(G)
    kOnion_values = nx.onion_layers(G)

    kCore_dict = {}
    for node_idx in G.nodes():
        value_kCore = kCore_values[node_idx]
        if value_kCore not in kCore_dict:
            kCore_dict[value_kCore] = []
        kCore_dict[value_kCore].append(node_idx)

    node_island_idx = {}

    def component_sorting_key(component):
        component_size = len(component)
        max_kOnion_value = max(kOnion_values[node] for node in component)
        sum_kOnion_value = sum(kOnion_values[node] for node in component)
        return (max_kOnion_value, sum_kOnion_value, component_size)

    for kCore_value in sorted(kCore_dict.keys()):
        nodes_in_kCore = set(kCore_dict[kCore_value])
        kCore_subgraph = G.subgraph(nodes_in_kCore)
        connected_components = list(nx.connected_components(kCore_subgraph))
        connected_components = sorted(
            connected_components,
            key=component_sorting_key,
            reverse=True,
        )
        for island_idx, node_idx_set in enumerate(connected_components):
            for node_idx in node_idx_set:
                node_island_idx[node_idx] = island_idx

    rows = []
    for node_idx in G.nodes():
        rows.append(
            {
                "node_idx": node_idx,
                "value_kCore": kCore_values[node_idx],
                "value_kOnion": kOnion_values[node_idx],
                "island_idx": node_island_idx.get(node_idx, 0),
            }
        )

    df = pd.DataFrame(rows)
    df = df.sort_values(
        ["value_kCore", "island_idx", "value_kOnion"]
    ).reset_index(drop=True)

    unique_cores = sorted(df["value_kCore"].unique())

    SPAN = 6
    vertical_spacing_json = 0

    d3_data = {
        "metadata": {
            "filename": filename,
            "total_nodes": len(G.nodes()),
            "total_edges": len(G.edges()),
            "num_cores": len(unique_cores),
        },
        "cores": [],
    }

    for core in unique_cores:
        core_mask = df["value_kCore"] == core
        core_data = df[core_mask]

        x_values = core_data.index.tolist()
        max_x = max(x_values)

        core_obj = {"core_value": int(core), "islands": []}

        unique_islands = sorted(core_data["island_idx"].unique())

        for island in unique_islands:
            island_mask = core_data["island_idx"] == island
            island_data = core_data[island_mask]

            island_obj = {"island_idx": int(island), "nodes": []}

            for _, row in island_data.iterrows():
                x_pos = int(row.name) - max_x
                island_obj["nodes"].append(
                    {
                        "node_idx": int(row["node_idx"]),
                        "x_position": x_pos,
                        "onion_value": int(row["value_kOnion"]) + vertical_spacing_json,
                    }
                )

            core_obj["islands"].append(island_obj)

        d3_data["cores"].append(core_obj)
        vertical_spacing_json += SPAN

    out_dir = os.path.join(public_dir, filename)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, f"{filename}_kSnakes.json"), "w") as f:
        json.dump(d3_data, f, indent=2)
