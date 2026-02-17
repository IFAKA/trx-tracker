# Release Process

TrainDaily uses **semantic-release** for automated versioning and releases.

## 🤖 How It Works

Every push to `main` branch:
1. **Analyzes commits** since last release
2. **Calculates new version** based on commit types
3. **Updates version files** (package.json, tauri.conf.json, Cargo.toml)
4. **Builds .dmg installer** (macOS only, via GitHub Actions)
5. **Creates GitHub release** with .dmg attached

**No manual version editing needed!**

---

## ✍️ Commit Message Format

Use **Conventional Commits** format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Commit Types → Version Bumps

| Type       | Description                | Version Bump | Example                           |
|------------|----------------------------|--------------|-----------------------------------|
| `feat:`    | New feature                | **MINOR**    | `feat: add mobile sync`           |
| `fix:`     | Bug fix                    | **PATCH**    | `fix: mic detection crash`        |
| `perf:`    | Performance improvement    | **PATCH**    | `perf: optimize database queries` |
| `revert:`  | Revert previous change     | **PATCH**    | `revert: undo workout cache`      |
| `docs:`    | Documentation only         | *None*       | `docs: update README`             |
| `style:`   | Code style (no logic change) | *None*     | `style: format code`              |
| `refactor:`| Refactor (no new features) | *None*       | `refactor: extract hook`          |
| `test:`    | Add/update tests           | *None*       | `test: add unit tests`            |
| `chore:`   | Maintenance tasks          | *None*       | `chore: update deps`              |
| `ci:`      | CI/CD changes              | *None*       | `ci: fix GitHub Actions`          |

### Breaking Changes → MAJOR

Add `!` after type or `BREAKING CHANGE:` in footer:

```bash
# Option 1: Exclamation mark
feat!: redesign workout flow

# Option 2: Footer
feat: redesign workout flow

BREAKING CHANGE: Removed old workout API
```

**Result:** `0.x.x` → `1.0.0` (MAJOR bump)

---

## 📝 Examples

### Feature Release (0.1.0 → 0.2.0)
```bash
git commit -m "feat: add workout history export"
git push origin main
# ✅ Triggers release: v0.2.0
# ✅ Builds TrainDaily_0.2.0_aarch64.dmg
# ✅ GitHub release created with .dmg attached
```

### Bug Fix (0.2.0 → 0.2.1)
```bash
git commit -m "fix: rest timer not counting down"
git push origin main
# ✅ Triggers release: v0.2.1
```

### Multiple Commits (picks highest)
```bash
git commit -m "docs: update README"
git commit -m "fix: audio glitch"
git commit -m "feat: add dark mode toggle"
git push origin main
# ✅ Triggers release: v0.3.0 (feat > fix > docs)
```

### No Release
```bash
git commit -m "chore: update dependencies"
git push origin main
# ❌ No release triggered (chore doesn't bump version)
```

---

## 🚀 Manual Release (Local Testing)

Test semantic-release locally **without** creating a real release:

```bash
# Dry-run (shows what would happen)
pnpm run release:dry

# Manual release (requires GITHUB_TOKEN)
GITHUB_TOKEN=ghp_xxxxx pnpm run release
```

---

## 📦 Version Files

Semantic-release automatically updates these files:

1. **`package.json`**
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **`packages/desktop/src-tauri/tauri.conf.json`**
   ```json
   {
     "version": "0.2.0"
   }
   ```

3. **`packages/desktop/src-tauri/Cargo.toml`**
   ```toml
   [package]
   version = "0.2.0"
   ```

All synced by `scripts/sync-version.js` during release.

---

## 🔄 GitHub Actions Workflow

Located at `.github/workflows/release-desktop.yml`

**Triggers:**
- Every push to `main` branch
- Manual trigger via GitHub UI (Actions tab)

**Steps:**
1. Checkout code
2. Install Node.js, pnpm, Rust
3. Run `semantic-release` (bumps version if needed)
4. Build Tauri .dmg (if version bumped)
5. Upload .dmg to GitHub release

**Environment:**
- Runs on `macos-latest` (required for .dmg build)
- Uses `GITHUB_TOKEN` (auto-provided by GitHub)

---

## 🎯 Best Practices

### ✅ Good Commits

```bash
feat: add workout streak counter
fix: prevent duplicate session saves
perf: cache exercise progression calculations
docs: add API documentation for sync server
```

### ❌ Bad Commits

```bash
update stuff           # Too vague, no type
feat add sync          # Missing colon
FIX: bug               # Type should be lowercase
feat:add-sync          # No space after colon
```

### 💡 Tips

- **One feature per commit** → Easier to track in changelog
- **Descriptive messages** → Users understand what changed
- **Use `feat:` liberally** → Each feature gets a minor bump
- **Breaking changes rare** → Only for incompatible changes

---

## 📖 Changelog

Automatically generated at each release:
- GitHub Releases page shows full changelog
- Based on commit messages between releases
- Grouped by type (Features, Bug Fixes, etc.)

**Example Release Notes:**
```markdown
## v0.2.0 (2025-02-17)

### Features
- add mobile sync (#12)
- add workout history export (#14)

### Bug Fixes
- mic detection crash on Teams calls (#13)
- rest timer skipping sets (#15)
```

---

## 🛠️ Troubleshooting

### Release not triggered?

Check commit message format:
```bash
git log --oneline -1
# Should show: "feat: description" or "fix: description"
```

### Version didn't bump?

- Commits since last release only have `docs:`, `chore:`, etc. (no bump)
- Run `pnpm run release:dry` to see analysis

### .dmg not in release?

- Check GitHub Actions logs (Actions tab)
- macOS build may have failed (check Rust/Tauri errors)

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release docs](https://semantic-release.gitbook.io/)
- [Tauri versioning](https://tauri.app/v1/guides/distribution/versioning/)
