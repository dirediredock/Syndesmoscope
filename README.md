# Syndesmoscope -- An instrument to observe connectivity

> An interactive tool that visually surfaces topological patterns from the connectivity of networked data.

*"syndesmos" means bond, link, or "to bind together" and "scope" means "instrument to observe"; so "an instrument to observe connectivity".*

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

Step 2 -- When work of the day is complete, commit all changes on VS Code and `push`, then return to `main` for a fresh start next time.

```
git push
git push --set-upstream origin local_edits
git fetch origin main:main
git checkout main
```

Step 3 -- Back to Step 1.
