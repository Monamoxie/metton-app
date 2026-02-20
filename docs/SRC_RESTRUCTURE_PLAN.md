# Plan: Restructure repo with `src/api` and `src/frontend`

**Status: Completed.** Migration applied; Docker and docs updated.

## Goal

- Add a **`src/`** folder at repo root.
- **`src/api`** = all backend (Django) code (current root-level backend files and folders).
- **`src/frontend`** = current **`frontend/`** folder (moved under `src/`).
- **No breakages**: Docker, scripts, CI, and configs must keep working.
- **Root unchanged** for: `terraform`, `.shell`, `.docker`, `.nginx`, `.github`, `.aws`, `.devcontainer`, `.cursor`, `.vscode`, `.git`, `.env*`, `docker-compose.yml`, `README.md`, `venv`, `mysql`, etc.

---

## 1. Target layout (after migration)

```text
metton/
├── .aws/
├── .cursor/
├── .devcontainer/
├── .docker/
├── .github/
├── .nginx/
├── .shell/
├── .terraform/
├── .vscode/
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── .prettierignore
├── docker-compose.yml
├── README.md
├── SECURITY.md
├── mysql/
├── venv/
│
└── src/
    ├── api/                    # Django app root (current backend)
    │   ├── manage.py
    │   ├── requirements.txt
    │   ├── core/
    │   ├── dashboard/
    │   ├── identity/
    │   ├── event/
    │   ├── home/
    │   └── workspace/
    │
    └── frontend/               # current frontend/ (moved)
        ├── package.json
        ├── src/
        ├── public/
        └── ...
```

---

## 2. What moves where

| Current location (root)     | New location      |
|----------------------------|-------------------|
| `manage.py`                | `src/api/manage.py` |
| `requirements.txt`         | `src/api/requirements.txt` |
| `core/`                    | `src/api/core/`   |
| `dashboard/`               | `src/api/dashboard/` |
| `identity/`                | `src/api/identity/` |
| `event/`                   | `src/api/event/`  |
| `home/`                    | `src/api/home/`   |
| `workspace/`               | `src/api/workspace/` |
| `frontend/` (entire dir)   | `src/frontend/`   |

Everything else (dot folders, terraform, docker-compose, README, venv, etc.) stays at root.

---

## 3. What does **not** need code changes

- **Django settings**  
  `BASE_DIR = Path(__file__).resolve().parent.parent` will point to `src/api` (parent of `core/`). Paths like `BASE_DIR / "core" / "static"` stay correct.
- **Python imports**  
  All `core.*`, `dashboard.*`, etc. are unchanged; only the filesystem location of the app root changes.
- **Nginx container paths**  
  Inside the API container the app root is still `/app`, with `core/` under it. So `/app/core/static` and `/app/core/media` stay valid. No nginx config changes.
- **ECS task definition**  
  `containerPath`: `/app/core/media` and `/var/www/static` are unchanged.
- **Entrypoint scripts**  
  `.shell/python_entrypoint.sh` and `node_entrypoint.sh` run `manage.py` and `npm` from the working directory set by Docker; we’ll set that to `/app` = `src/api` (and `src/frontend` for node) via compose/Dockerfile.

---

## 4. Changes required (checklist)

### 4.1 Create `src/` and move code

1. Create `src/` at repo root.
2. Create `src/api/` and move into it:
   - `manage.py`
   - `requirements.txt`
   - `core/`
   - `dashboard/`
   - `identity/`
   - `event/`
   - `home/`
   - `workspace/`
3. Move `frontend/` to `src/frontend/` (so the former becomes `src/frontend/`).

### 4.2 Docker: `docker-compose.yml`

- **Python service**  
  - Change volume from `.:/app` to **`./src/api:/app`** so the container’s `/app` is the Django project root.
- **Nginx service**  
  - Change bind-mount from `./core/static:/app/core/static` to **`./src/api/core/static:/app/core/static`** (so nginx still sees the same path inside the container).
- **Node service**  
  - Change volume from `./frontend:/app` to **`./src/frontend:/app`**.

No other compose changes (env, ports, networks, postgres, rabbitmq, volumes) are needed.

### 4.3 Docker: `.docker/Dockerfile.python`

- **Build context** remains repo root (`.`).
- Replace:
  - `COPY . /app/`
  - `COPY requirements.txt ./app/`
  - `RUN pip install ... -r ./app/requirements.txt`
- With:
  - `COPY src/api /app/`
  - `COPY ./.shell /app/.shell/`
  - `RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt`
- Keep:
  - `WORKDIR /app`
  - `VOLUME /var/www/static`, `VOLUME /app/core/media`
  - `ENTRYPOINT ["/app/.shell/python_entrypoint.sh"]`

So the image only contains API code under `/app` and the entrypoint script under `/app/.shell/`. No change to `manage.py` or Django logic.

### 4.4 Docker: `.docker/Dockerfile.node`

- Replace `COPY ./frontend ./` with **`COPY ./src/frontend ./`**.
- Keep `COPY ./.shell/node_entrypoint.sh /usr/local/bin/` (still at repo root).

### 4.5 Docker: `.dockerignore`

- Update frontend-related ignores from `frontend/` to **`src/frontend/`** so they match the new paths (e.g. `src/frontend/node_modules`, `src/frontend/.next/`, `src/frontend/out/`, etc.). This keeps build context smaller when building from root.

### 4.6 Dev container: `.devcontainer/devcontainer.json`

- No path changes needed: it uses `"context": ".."` and `"dockerfile": "../.docker/Dockerfile.python"`. If the dev container runs the app by mounting the repo and running from a directory, you’ll run from `src/api` (e.g. `workspaceFolder` or `postCreateCommand` that `cd`s into `src/api` if you use one). Optional: set `"workspaceFolder": "/workspaces/metton/src/api"` (or equivalent) so the default folder inside the container is the API root.

### 4.7 CI: `.github/workflows/metton.yml`

- Build context is repo root; Dockerfiles use paths like `./.docker/Dockerfile.python` and `COPY src/api /app/`, so no workflow file changes are required. The existing `docker compose config` and `docker build -f ./.docker/Dockerfile.$service .` remain valid.

### 4.8 ECS / AWS

- `.aws/ecs-task-template.json`: `containerPath` values (`/app/core/media`, `/var/www/static`) are unchanged. No edits.

### 4.9 README and docs

- **README.md**: Update any paths that point at the old structure, e.g.:
  - `core/static/images/...` → **`src/api/core/static/images/...`**
  - References to “core/static” in prose → “src/api/core/static” where you want docs to match the new layout.

### 4.10 Local / IDE

- **venv**: Can stay at repo root. From repo root: `source venv/bin/activate && cd src/api && python manage.py runserver` (or use your usual run config with working directory `src/api`).
- **VS Code / Cursor**: If you have launch configs or tasks that reference `frontend/` or `manage.py` at root, update them to `src/frontend/` and `src/api/manage.py` (or run from `src/api`).

---

## 5. Order of operations (recommended)

1. **Create directories and move backend**
   - `mkdir -p src/api`
   - Move `manage.py`, `requirements.txt`, `core`, `dashboard`, `identity`, `event`, `home`, `workspace` into `src/api/`.
2. **Move frontend**
   - `mv frontend src/frontend`
3. **Update Docker**
   - Edit `docker-compose.yml` (volumes for python, nginx, node).
   - Edit `.docker/Dockerfile.python` (COPY and pip install as above).
   - Edit `.docker/Dockerfile.node` (COPY frontend → src/frontend).
   - Update `.dockerignore` for `src/frontend/` paths.
4. **Smoke test**
   - From repo root: `docker compose up --build -d`.
   - Check: API (e.g. port 8000 / through nginx), frontend (e.g. port 3200), static/media.
5. **Update docs and tooling**
   - README paths, devcontainer `workspaceFolder` (if used), any scripts or IDE configs that assume `frontend/` or root-level `manage.py`.

---

## 6. Rollback

- Keep a branch or tag before moving files.
- Rollback = move `src/api/*` back to root, move `src/frontend` back to `frontend/`, and revert the Docker and doc changes above.

---

## 7. Summary

- **Yes, it’s possible** to do this without breakages.
- Backend and frontend both move under `src/`; all path updates are in **Docker (compose + Dockerfiles + .dockerignore)** and **documentation/scripts**. Django, nginx, and ECS configs can stay as they are because container paths remain `/app` and `/app/core/...`.

If you want, next step can be applying these edits (compose, Dockerfiles, .dockerignore, README) and then you run the moves and tests.
