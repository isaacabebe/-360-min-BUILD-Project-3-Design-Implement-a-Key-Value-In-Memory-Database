# PatchNotes — Redis Key-Value Layer
**CS3200 — Project 3 | Isaac Abebe**

PatchNotes uses Redis as a fast in-memory layer on top of its MongoDB database. Three features are implemented using Redis data structures: a real-time meta score leaderboard, active user session tracking, and a recent patches feed.

---

## 🎥 Video Demo
*(paste your YouTube/Zoom link here)*

---

## Repository Structure

```
patchnotes-redis/
├── redis_design.pdf      # Data structure descriptions + all CRUD commands
├── redis_script.js       # Node script implementing all three Redis structures
├── package.json          # ES6 module config + redis dependency
└── README.md
```

---

## Redis Data Structures

| Structure | Key Pattern | Purpose |
|---|---|---|
| Sorted Set | `leaderboard:<game>` | Characters/weapons ranked by avg meta score |
| Hash | `session:<username>` | Active user session tracking |
| List | `recent_patches` | Feed of most recently released patches (capped at 10) |

---

## Prerequisites

**1. Start Redis via Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

**2. Install dependencies:**
```bash
npm install
```

---

## How to Run

```bash
node redis_script.js
```

Expected output walks through all CRUD operations for each data structure — create, read, update, and delete — with printed results at each step.

---

## AI Disclosure

Claude (Anthropic) was used to assist with:
- Structuring the Redis data structure design and selecting appropriate key patterns
- Writing the Node.js script implementing all three data structures
- Generating this README

All design decisions (which features to cache, which Redis structures to use, and why) were made by Isaac Abebe based on class material and understanding of the PatchNotes data model.
