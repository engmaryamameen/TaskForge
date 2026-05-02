#!/usr/bin/env sh
# Vercel ignoreCommand: exit 0 = skip this deployment, non-zero = run build.
# See https://vercel.com/docs/project-configuration/vercel-json#ignorecommand
#
# Skip when nothing under frontend/ changed. Always build on first deploy or
# if git range is unavailable.

set -e

if [ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ] || [ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 1
cd "$REPO_ROOT" || exit 1

# No diff in frontend/ -> quiet exit 0 -> Vercel skips build
# Any change in frontend/ -> non-quiet exit 1 -> Vercel builds
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- frontend/
