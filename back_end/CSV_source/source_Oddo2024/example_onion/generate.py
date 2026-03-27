import os
import random

import matplotlib.pyplot as plt
import networkx as nx

os.chdir(os.path.dirname(os.path.abspath(__file__)))

edgelist = [
    (0, 1),
    (1, 2),
    (2, 3),
    (3, 4),
    (4, 5),
    (4, 6),
    (3, 7),
    (7, 8),
    (8, 9),
    (9, 10),
    (9, 11),
    (9, 13),
    (10, 11),
    (11, 13),
    (13, 12),
    (11, 12),
    (11, 14),
    (14, 15),
    (14, 16),
]

G = nx.Graph()
G.add_edges_from(edgelist)

G_pos = nx.spring_layout(G, seed=2)

plt.figure(figsize=(8, 8))
nx.draw(
    G,
    G_pos,
    with_labels=True,
    node_color="lightblue",
)
plt.show()

###############################################################################

# print(f"Number of nodes: {G.number_of_nodes()}")
# print(f"Number of edges: {G.number_of_edges()}")

with open("topology.csv", "w") as f:
    for u, v in G.edges():
        f.write(f"{u},{v}\n")

with open("embedding.csv", "w") as f:
    for node_idx in sorted(G_pos.keys()):
        x, y = G_pos[node_idx]
        # print(f"{node_idx}: ({x}, {y})")
        f.write(f"{x},{y}\n")

###############################################################################
