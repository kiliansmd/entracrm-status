# entraCRM public web status

Independent public status channel hosted on GitHub Pages. Uses only the existing
public health endpoints; no CRM database credentials, customer information or
private operational signals are read or published.

The standard public GitHub runner probes the two public applications about every
ten minutes. The page labels stale or incomplete measurements explicitly. This
is a reachability report, not a confirmation that every CRM feature is healthy.

No npm dependencies, analytics, external fonts, custom domain or paid runner.
GitHub Pages builds are requested explicitly because pushes authenticated with
GITHUB_TOKEN do not trigger Pages builds automatically.

Run checks with `node --test scripts/probe.test.mjs`. Refresh the measurements
with `node scripts/probe.mjs` and publish `/docs` from `main` using GitHub Pages.
