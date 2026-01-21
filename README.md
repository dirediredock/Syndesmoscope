# Syndesmoscope: A Visual Instrument for Observing Connectivity

An interactive tool that visually surfaces topological patterns from the connectivity of networked data.

*The name 'Syndesmoscope' is a neoclassical compound word built from Greek roots: 'syndesmos', which means bond or link as a noun, or "to bind together" as a verb; and 'scope', which means "instrument for observing"; thus, "an instrument for observing connectivity".*

# Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
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
