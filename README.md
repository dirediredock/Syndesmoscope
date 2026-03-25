# Syndesmoscope: Linking Invariant Plots and Traditional Network Views

Syndesmoscope is a browser-based interactive system that enables deep exploration of network topology by coordinating multiple network visualization idioms through linked highlighting.

The name 'Syndesmoscope' is a neoclassical compound word built from Greek roots: 'syndesmos', which means bond or link as a noun, or "to bind together" as a verb; and 'scope', which means "instrument for observing"; thus, "an instrument for observing connections".

<img src="figures/Teaser_00_dark.png" width="100%" ></a>

Syndesmoscope juxtaposes four panes that surface maximally orthogonal visual patterns computed from the same network dataset. (A) kSnakes pane, a new invariant plot. (B) HopCensus pane, an invariant plot. (C) AdjacencyMatrix pane, with near-invariant seriation (Behrisch2016). (D) ForceDirected pane, a familiar variant view. (E) Above the panes, a control strip with tools for multi-item selection. In this example, the “Nematode Synapses (M)” dataset is loaded: the nervous system of the male C. elegans roundworm, comprising 484 cells (nodes) and 1597 synapses (edges). A selection in A highlights 43 nodes (blue) from the densest core (k-9 shell at the top); using E, their 273 shared edges (orange) are selected, with corresponding visual pattern highlighting shown across the B, C, and D panes.

<img src="figures/teaser_01.png" width="100%" ></a>

<img src="figures/teaser_01b.png" width="100%" ></a>

<img src="figures/teaser_02.png" width="100%" ></a>

<img src="figures/teaser_03.png" width="100%" ></a>

<img src="figures/teaser_04.png" width="100%" ></a>

<img src="figures/teaser_05.png" width="100%" ></a>

<img src="figures/teaser_06.png" width="100%" ></a>

# Development Setup

These steps assume that `npm` is already installed on your machine. This repository does **not** store or track the required web app scaffolding dependencies, so the first step is to navigate to the `Syndesmoscope` working directory in your terminal and install these locally.

```bash
# Install the dependencies required for the project from package.json and package-lock.json
npm install
```

Then, run the following commands.

```bash

# Start the development server (run once per work session)
npm run dev

# Build the project for production deployment
npm run build
```

# Git Cheatsheet

Step 0 -- Download the repo through the Command Line Interface (CLI).

```
cd src
gh repo clone dirediredock/Syndesmoscope
cd Syndesmoscope
```

Step 1 -- Use `checkout -b` to create and name a new branch.

```
git status
git checkout -b local_edits
git status
```

Step 2 -- When work of the day is complete, commit all changes on VS Code, then return to Terminal and `push` the commits, then finally return to `main` for a fresh start next time.

```
git push
git push --set-upstream origin local_edits
git fetch origin main:main
git checkout main
```

Step 3 -- Back to Step 1.
