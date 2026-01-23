# Git Branching Strategy - Transcend

## Branch Structure

### Main Branches

- **`main`** - Production-ready code
  - Always stable and deployable
  - Protected branch (requires PR + review)
  - Tagged for releases (v1.0.0, v1.1.0, etc.)
  - Deployed to production (app stores)

- **`develop`** - Integration branch
  - Latest development changes
  - All features merge here first
  - Used for internal testing and QA
  - Deployed to staging/test environment

### Supporting Branches

#### Feature Branches
**Pattern:** `feature/<feature-name>` or `feature/<issue-number>-<short-description>`

**Examples:**
```
feature/hormone-tracking
feature/23-transition-journal
feature/auth-integration
feature/community-moderation
```

**Workflow:**
```bash
# Create from develop
git checkout develop
git pull origin develop
git checkout -b feature/hormone-tracking

# Work on feature...
git add .
git commit -m "Add hormone plan registration screen"

# Push and create PR to develop
git push origin feature/hormone-tracking
```

#### Bugfix Branches
**Pattern:** `bugfix/<bug-description>` or `bugfix/<issue-number>-<short-description>`

**Examples:**
```
bugfix/login-validation
bugfix/45-supabase-connection
bugfix/notification-crash
```

**Workflow:** Same as features, branch from `develop`, merge back to `develop`

#### Hotfix Branches
**Pattern:** `hotfix/<version>-<description>`

**Examples:**
```
hotfix/1.0.1-critical-auth-bug
hotfix/1.1.1-data-leak
```

**Workflow:**
```bash
# Branch from main (for production fixes)
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-critical-auth-bug

# Fix the issue...
git commit -m "Fix critical authentication bug"

# Merge to both main AND develop
git checkout main
git merge hotfix/1.0.1-critical-auth-bug
git tag v1.0.1
git push origin main --tags

git checkout develop
git merge hotfix/1.0.1-critical-auth-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/1.0.1-critical-auth-bug
```

#### Release Branches (Optional, use when preparing app store releases)
**Pattern:** `release/<version>`

**Examples:**
```
release/1.0.0
release/1.1.0
```

**Workflow:**
```bash
# Create from develop when ready for release
git checkout develop
git checkout -b release/1.0.0

# Only bug fixes and version bumps here
# Update version in package.json, app.json
git commit -m "Bump version to 1.0.0"

# Merge to main and back to develop
git checkout main
git merge release/1.0.0
git tag v1.0.0
git push origin main --tags

git checkout develop
git merge release/1.0.0
git push origin develop

# Delete release branch
git branch -d release/1.0.0
```

## Workflow Summary

### Daily Development
```
develop
  └── feature/new-feature
  └── bugfix/some-bug
```

1. Branch from `develop`
2. Work on your feature/bugfix
3. Create PR to `develop`
4. Code review by teammate
5. Merge to `develop`
6. Delete feature branch

### Preparing a Release
```
develop → release/1.0.0 → main (tagged v1.0.0)
                        ↓
                     develop (merge back)
```

### Emergency Production Fix
```
main → hotfix/1.0.1-critical → main (tagged v1.0.1)
                              ↓
                           develop (merge back)
```

## Branch Protection Rules

Configure on GitHub/GitLab:

### `main` branch:
- ✅ Require pull request reviews (at least 1)
- ✅ Require status checks to pass (tests, linting - when configured)
- ✅ Require branches to be up to date
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### `develop` branch:
- ✅ Require pull request reviews
- ✅ Do not allow force pushes
- ⚠️ Can be more relaxed than `main`

## Commit Message Convention

Use conventional commits for better changelog generation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks (dependencies, config)
- `perf:` Performance improvements

**Examples:**
```
feat(auth): add biometric authentication support

Implement Touch ID and Face ID for quick login on iOS and Android.
Uses expo-local-authentication module.

Closes #42

---

fix(journal): prevent crash when uploading large images

Compress images before upload to avoid memory issues on low-end devices.

---

docs: update setup instructions in README

---

chore(deps): upgrade expo to 54.0.22
```

## Naming Conventions

### Branch Names
- Use lowercase and hyphens
- Be descriptive but concise
- Include issue number when applicable

✅ **Good:**
```
feature/hormone-tracking
feature/23-add-notification-system
bugfix/login-validation-error
hotfix/1.0.1-data-leak
```

❌ **Bad:**
```
myFeature
feature/new_stuff
john-working-on-auth
fix
```

### Tags
Follow semantic versioning:
```
v1.0.0  - Major release
v1.1.0  - Minor release (new features)
v1.0.1  - Patch release (bug fixes)
```

## Team Collaboration

### Before Starting Work
```bash
# Always sync with develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### Before Creating PR
```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop  # or rebase if you prefer

# Resolve conflicts if any
# Push and create PR
git push origin feature/your-feature
```

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] No sensitive data (API keys, credentials)
- [ ] TypeScript types are properly defined
- [ ] Supabase RLS policies are implemented
- [ ] No console.log statements left in code
- [ ] PR description explains what and why
- [ ] Related issue is linked

## Example Team Workflow

**Marina** working on hormone tracking:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/hormone-tracking
# ... work, commit, push ...
# Create PR: feature/hormone-tracking → develop
```

**Deividy** reviewing Marina's PR:
```bash
# Review on GitHub
# Approve and merge to develop
```

**Sara** working on journal feature (parallel):
```bash
git checkout develop
git pull origin develop
git checkout -b feature/transition-journal
# ... work independently ...
```

**Anne** fixing a bug:
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/supabase-connection
# ... fix, commit, push, PR ...
```

## When to Use Each Branch Type

| Situation | Branch Type | Example |
|-----------|-------------|---------|
| New feature | `feature/*` | `feature/hormone-tracking` |
| Bug in develop | `bugfix/*` | `bugfix/login-crash` |
| Bug in production | `hotfix/*` | `hotfix/1.0.1-data-leak` |
| Preparing release | `release/*` | `release/1.0.0` |

## FAQ

**Q: Can I work directly on `develop`?**
A: No, always create a feature/bugfix branch. This keeps develop stable and allows for code review.

**Q: When should I create a release branch?**
A: Only when preparing for app store submission and you need to freeze features while fixing last-minute bugs.

**Q: How do I handle merge conflicts?**
A: Update your branch with `develop`, resolve conflicts locally, test, then push.

**Q: Should I delete my branch after merging?**
A: Yes, keep the repository clean. GitHub can auto-delete after PR merge.

**Q: Can I push directly to `main`?**
A: No, `main` should be protected. Only merge through PRs or hotfix process.
