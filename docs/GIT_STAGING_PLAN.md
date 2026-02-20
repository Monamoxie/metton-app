# Plan: Staging Git Changes (Excluding Frontend)

## Goal
- Stage **all changes** EXCEPT files in `src/frontend/`
- Manually review and selectively stage `src/frontend/` files
- Note: Frontend was moved from `frontend/` to `src/frontend/`, so git shows deletions of old `frontend/` files

---

## Step-by-Step Plan

### Step 1: Review Current Changes
First, see what's changed:

```bash
# See all changes (including frontend)
git status

# See only non-frontend changes
git status --short | grep -v 'src/frontend'

# See only frontend changes
git status --short | grep 'src/frontend'
```

### Step 2: Stage Everything EXCEPT Frontend

**Option A: Using git add with path exclusions (Recommended)**
```bash
# Stage all changes (including deletions of old frontend/)
git add .

# Unstage new src/frontend/ files (but keep deletions of old frontend/)
git reset HEAD src/frontend/

# Verify what's staged
# Should show: deletions of old frontend/, but NOT new src/frontend/ files
git status --short
```

**Note:** This will stage the **deletions** of old `frontend/` files (which is correct since they moved), but **not** the new `src/frontend/` files (which you'll add selectively).

**Option B: Using git add with specific paths**
```bash
# Stage root-level files
git add .gitignore .dockerignore docker-compose.yml README.md docs/

# Stage src/api (all backend)
git add src/api/

# Stage Docker configs
git add .docker/ .nginx/ .shell/

# Stage other root directories (if any)
git add .devcontainer/ .github/ .aws/ .terraform/ .cursor/ .vscode/

# Verify what's staged
git status --short
```

**Option C: Using .gitignore temporarily (Safest)**
```bash
# Temporarily add frontend to .gitignore
echo "src/frontend/" >> .gitignore

# Stage everything (frontend will be ignored)
git add .

# Remove the temporary entry from .gitignore
git checkout .gitignore
# OR manually edit .gitignore to remove the line

# Verify
git status --short
```

### Step 3: Review Frontend Changes Carefully

```bash
# See what new frontend files exist (untracked)
git status --short | grep 'src/frontend'

# See all new frontend files that would be added
git ls-files --others --exclude-standard src/frontend/

# Review specific new files
git diff --no-index /dev/null src/frontend/package.json  # See new file content
# OR just view the file directly
cat src/frontend/package.json

# Compare old vs new (if you want to see what changed)
# Note: git won't auto-detect the move, so compare manually if needed
```

### Step 4: Selectively Stage Frontend Files

**Option A: Stage specific files**
```bash
# Stage individual files
git add src/frontend/package.json
git add src/frontend/next.config.mjs
git add src/frontend/src/components/SomeComponent.tsx

# Stage specific directories
git add src/frontend/src/types/
git add src/frontend/public/
```

**Option B: Stage by pattern**
```bash
# Stage only config files
git add src/frontend/*.json src/frontend/*.mjs src/frontend/*.js

# Stage only TypeScript files in a specific directory
git add src/frontend/src/types/*.ts
```

**Option C: Interactive staging (Most Control)**
```bash
# Interactive mode - choose files one by one
git add -p src/frontend/

# Or use interactive mode for specific files
git add -i
# Then select files interactively
```

### Step 5: Verify Final Staging

```bash
# See everything that's staged
git status

# See staged changes summary
git diff --cached --stat

# Review staged changes
git diff --cached
```

### Step 6: Commit

```bash
# Commit staged changes
git commit -m "Restructure: Move backend to src/api and frontend to src/frontend

- Moved Django app to src/api/
- Moved frontend to src/frontend/
- Updated Docker configs and paths
- Updated requirements.txt (asgiref version)
- Fixed Postgres volume mount for v18+
- [Selectively staged frontend changes]"
```

---

## Recommended Workflow (Safest)

```bash
# 1. Review all changes
git status

# 2. See what frontend files are new (untracked)
git status --short | grep 'src/frontend'

# 3. Stage everything (including deletions of old frontend/)
git add .

# 4. Unstage new src/frontend/ files (keep deletions staged)
git reset HEAD src/frontend/

# 5. Verify what's staged
git status --short
# Should show: deletions of old frontend/ files are staged
# Should show: new src/frontend/ files are NOT staged (marked with ??)

# 6. Review new frontend files to decide what to stage
git ls-files --others --exclude-standard src/frontend/ | less

# 7. Stage frontend files selectively
git add src/frontend/package.json          # Config files
git add src/frontend/package-lock.json
git add src/frontend/next.config.mjs
git add src/frontend/src/types/            # Type definitions
# ... add other files/directories as needed

# 8. Final verification
git status
git diff --cached --stat  # See summary of staged changes

# 9. Commit
git commit -m "Restructure: Move backend to src/api and frontend to src/frontend

- Moved Django app to src/api/
- Moved frontend to src/frontend/ (selective files)
- Updated Docker configs and paths
- Updated requirements.txt (asgiref version)
- Fixed Postgres volume mount for v18+"
```

---

## Alternative: Two Separate Commits

If you prefer to keep frontend changes separate:

```bash
# Commit 1: Everything except frontend
git add .
git reset HEAD src/frontend/
git commit -m "Restructure: Move backend to src/api, update Docker configs"

# Commit 2: Frontend changes (selective)
git add src/frontend/package.json
git add src/frontend/src/types/
# ... add other frontend files
git commit -m "Restructure: Move frontend to src/frontend (selective changes)"
```

---

## Useful Commands Reference

```bash
# See what would be staged (dry run)
git add --dry-run .

# Unstage everything
git reset HEAD

# Unstage specific file
git reset HEAD path/to/file

# See diff of staged changes
git diff --cached

# See diff of unstaged changes
git diff

# See diff of specific file
git diff src/frontend/path/to/file.tsx

# Interactive staging (patch mode)
git add -p src/frontend/file.tsx
```

---

## Safety Tips

1. **Always review before staging**: Use `git status` and `git diff` to see what will be staged
2. **Use `git add -p` for careful review**: Interactive patch mode lets you review each change
3. **Commit in stages**: Consider committing backend changes first, then frontend separately
4. **Keep a backup**: If unsure, create a branch first: `git checkout -b staging-review`
5. **Test after staging**: Verify your app still works after staging changes

---

## Quick Reference

| Task | Command |
|------|---------|
| Stage all except frontend | `git add . && git reset HEAD src/frontend/` |
| See frontend changes | `git diff src/frontend/` |
| Stage specific file | `git add src/frontend/path/to/file.tsx` |
| Interactive staging | `git add -p src/frontend/` |
| See what's staged | `git status` or `git diff --cached` |
| Unstage everything | `git reset HEAD` |
