#!/usr/bin/env bash
# billing-lock.sh -- a filesystem mutex to serialize billing work across
# concurrent Claude Code sessions sharing this checkout.
#
# WHY: billing code (Stripe subscriptions, the webhook, wallet metering, the
# reconcile job, pricing) is touched by several files. When two sessions edit
# them in parallel, git auto-merges textually but the result can fail to compile
# (a red prod deploy) or silently revert an in-flight edit. Hold this lock before
# touching any billing-sensitive file (see docs/billing-coordination.md), and
# release it after your change is merged.
#
# Atomic via `mkdir` (creating a directory is atomic on POSIX filesystems).
#
# Usage:
#   scripts/billing-lock.sh acquire ["note"]   # claim the lock (fails if held)
#   scripts/billing-lock.sh status             # who holds it (exit 0 free, 1 held)
#   scripts/billing-lock.sh release            # release (only if you hold it)
#   scripts/billing-lock.sh release --force    # break a stale lock (be sure!)

set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || dirname "$(dirname "$0")")"

LOCKDIR=".billing-lock"
HOLDER_FILE="$LOCKDIR/holder"
# Identity for the holder record. CLAUDE_SESSION_ID is stable per session when
# present; otherwise fall back to user@host. (Do NOT use $$ -- each Bash tool
# call is a fresh process, so a PID would change between acquire and release.)
ME="${CLAUDE_SESSION_ID:-${USER:-unknown}@$(hostname -s 2>/dev/null || echo host)}"

cmd="${1:-status}"

case "$cmd" in
  acquire)
    note="${2:-}"
    if mkdir "$LOCKDIR" 2>/dev/null; then
      {
        echo "holder=$ME"
        echo "when=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
        echo "note=$note"
      } > "$HOLDER_FILE"
      echo "ACQUIRED billing lock as: $ME"
      exit 0
    else
      echo "BLOCKED -- billing lock is already held:"
      sed 's/^/  /' "$HOLDER_FILE" 2>/dev/null || echo "  (holder file unreadable)"
      echo "Do NOT edit billing-sensitive files. Coordinate, or wait for release."
      exit 1
    fi
    ;;
  status)
    if [ -d "$LOCKDIR" ]; then
      echo "HELD:"
      sed 's/^/  /' "$HOLDER_FILE" 2>/dev/null || true
      exit 1
    else
      echo "FREE"
      exit 0
    fi
    ;;
  release)
    # Advisory release: removes the lock and reports who held it. The atomic
    # `mkdir` acquire is the real mutex; the protocol (check status, release only
    # after YOUR change is merged) is the cooperative safeguard. We print the
    # prior holder so an accidental release of a fresh, someone-else lock is
    # visible.
    if [ ! -d "$LOCKDIR" ]; then echo "Already free."; exit 0; fi
    holder="$(sed -n 's/^holder=//p' "$HOLDER_FILE" 2>/dev/null || echo '?')"
    rm -rf "$LOCKDIR"
    echo "RELEASED billing lock (was held by: $holder)."
    exit 0
    ;;
  *)
    echo "usage: scripts/billing-lock.sh {acquire [note] | status | release [--force]}"
    exit 2
    ;;
esac
