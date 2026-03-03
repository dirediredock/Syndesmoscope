import json
import os

from .graph_loader import BFS_Census, load_JSON_as_G


def export_Census_JSON(G, Census, Census_type, filename):
    data_schema = {
        "metadata": {
            "name": filename,
            "census_type": Census_type,
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "diameter": max(len(v) for v in Census.values()) if Census else 0,
        },
        "census_vectors": [],
    }
    for node_idx_str in Census.keys():
        node_idx = int(node_idx_str)
        census_vector = Census[node_idx_str]
        node_census = {
            "node_idx": node_idx,
            "vector_length": len(census_vector),
            "vector": census_vector,
        }
        data_schema["census_vectors"].append(node_census)
    return data_schema


def run(filename, scratch_dir, public_dir):
    G, _ = load_JSON_as_G(os.path.join(scratch_dir, f"{filename}.json"))

    Census_Node, Census_Edge, Census_Stub = BFS_Census(G)

    out_dir = os.path.join(public_dir, filename)
    os.makedirs(out_dir, exist_ok=True)

    node_data = export_Census_JSON(G, Census_Node, "Census-Node", filename)
    with open(os.path.join(out_dir, f"{filename}_CensusNode.json"), "w") as f:
        json.dump(node_data, f, indent=2)

    edge_data = export_Census_JSON(G, Census_Edge, "Census-Edge", filename)
    with open(os.path.join(out_dir, f"{filename}_CensusEdge.json"), "w") as f:
        json.dump(edge_data, f, indent=2)

    stub_data = export_Census_JSON(G, Census_Stub, "Census-Stub", filename)
    with open(os.path.join(out_dir, f"{filename}_CensusStub.json"), "w") as f:
        json.dump(stub_data, f, indent=2)
