# frozen_string_literal: true

# Per-worktree DB isolation must fail closed. A Claude worktree under
# .claude/worktrees/ that boots without DATABASE_SUFFIX set (bin/worktree-setup
# didn't run) would otherwise silently fall back to the main development/test
# databases and trample them.
if ENV["DATABASE_SUFFIX"].to_s.empty? && Rails.root.to_s.include?("/.claude/worktrees/")
  raise "DATABASE_SUFFIX is unset inside a Claude worktree (#{Rails.root}); " \
        "refusing to use the main database. Run bin/worktree-setup."
end
