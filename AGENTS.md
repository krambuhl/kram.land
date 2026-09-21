# kram.land

## Git workflow

Work directly on `main` and commit as you go. Each commit is one conceptual change, small enough to review and revert on its own.

Only safe commits land on `main`. A safe commit leaves the site working: `npm run verify` passes at that commit, not just at the end of the series. It runs the format check, oxlint, stylelint, type check, knip, the workspace tests and the build, and CI runs the same script on every push to `main` and every pull request.

Use a feature branch when the work can't be committed as a single safe unit, for example a migration whose intermediate steps break the build or only make sense together. Commit incrementally on the branch, then land it on `main` once the whole is safe.

Pushing is a separate step. Push when asked.
