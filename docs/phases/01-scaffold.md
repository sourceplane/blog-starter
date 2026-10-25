# 01-scaffold — the repo is born

**Places** the root manifests (`intent.yaml`, `package.json`, the pnpm
workspace and lockfile, `turbo.json`, the kiox pin), `.github/workflows`
(`ci.yml` — the baseline's own `baseline.yml` and `tag.yml` are ignored),
the shared TypeScript/ESLint config and the wrangler renderer,
the site's README and its two context pages, the identity file
`.rebrand/values.json`, and `.gitkeep` files for the four discovery roots.

**Requires** the GitHub App installation on `githuborg` — probed, waited for
up to ten minutes. The platform sees a pull request only through the
installation on the account that owns the repository.

## What runs

The run's task set-up — the epic, the three milestones, the three tasks —
runs in the background from the start (`background: true`), so every hook up
to `task` runs beside it; `task` is the first that waits for it.

| hook | what it does |
|---|---|
| `git-init`, `git-stage` | the rebrand enumerates with `git ls-files`, so the tree is a staged repo first |
| `rebrand` | renames the baseline's identity to the site's (`tooling/rebrand/rebrand.mjs`) |
| `orun-workspace` | writes the site's workspace into `intent.yaml` (`ws_SET_ME` if there is none — loud, not silent) |
| `work-tree` | removes the baseline's own `work:` block from `intent.yaml` — `specs/` and `tasks/` do not ship |
| `promotion` | defers prod's wait on stage until `03-docs` (both environments deploy side by side) |
| `dev-lanes` | keeps dev's verify lanes off main's convergences until `03-docs` |
| `rebrand-verify` | refuses the landing if any baseline identity is left |
| `repo` | `orun.repo/ensure@v1` — creates `githuborg/reponame` (private unless `repoPrivate=false`) |
| `link` | `orun cloud link` (best effort) then `orun cloud check` — an unlinked repo stops here |
| `task` | finds the phase's task (opened by the run-level list) and yields its key — waiting, if it must, for the background set-up |
| `land` | one PR bound to the task, its commit checked in the box first (`checks: local`: `orun validate`, then `orun plan` as the PR and as the merge would plan it, under a second); merged without waiting for the PR's CI |

## Verified

The repository exists, is linked to the workspace, and its first commit was
validated and planned in the box, then merged. Nothing deploys in this phase
— there are no components yet — so there is no convergence to watch.

## Troubleshooting

| symptom | cause → fix |
|---|---|
| parks on `waiting for github for <org>` | the workspace's GitHub connection is to another account. Connect the App installation on `<org>` (console → Integrations → GitHub), then `--resume` |
| `link` fails: `… is not linked to workspace` | the credential cannot write links and the platform has not linked the repo. Allow-list it (console → Settings → Git repos) and re-run the phase |
| `land`: `the landing's own check failed — orun plan for …` | the placed tree does not plan; the next line is orun's error. Nothing was pushed. Fix it and re-run the phase |
| `rebrand-verify` lists leftovers | a file carries an identity form no rule renames. Add a rule to `tooling/rebrand/rebrand.mjs` (and a case to `testing/rebrand.test.sh`) |
| `intent.yaml` says `workspace: ws_SET_ME` | `orunWorkspace` was empty and the build ran outside a workspace. Set it and re-run |
