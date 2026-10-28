# Finish the GitHub handoff and newsletter

Prepared October 28, 2026 for the October 29 Automation Thursday issue.

Draft PR: [#1](https://github.com/rtomboj/innovate-project-development-mode/pull/1). All project additions stay under `make-the-case/`; the repository's existing root README and methodology remain unchanged. The repository is public. The PR is open, draft, and mergeable at the inspected revision. No GitHub checks or commit statuses were reported; the validation described here is local.

The reader route is now [module README](../README.md) → [Start here](../START-HERE.md) → [downloadable Sheets kit](../downloads/make-the-case-google-sheets-v0.5.0.zip). The screenshot shows the actual built Coach in its fictional local demonstration. The package checksum is in [SHA256SUMS](../downloads/SHA256SUMS.txt).

## What is prepared

- The approved dialogue layout, compact progress panel, Kanban/outcomes, stable app header, and top New idea button are integrated in the actual Coach.html.
- The three replacement files are Code.gs, Core.gs, and Coach.html. Providers.gs and the manifest are unchanged.
- 64 automated checks passed, plus documented local browser checks. Packaging includes integrity and replacement-file verification. Reader links/assets and credential-pattern checks passed.
- Both the [newsletter article](newsletter-draft.md) and [launch post](launch-post-draft.md) continue the Dana teaser. They are drafts, not published posts. The [publishing notes](newsletter-publishing-notes.md) identify the final links and checks.

## What Rachel needs to finish

1. Install the three replacement files in the existing bound Apps Script project, run setupWorkspace, and reopen from the Sheet. Use [Update and test](../apps-script/UPDATE-AND-TEST.md).
2. Complete one real-account pass: send a permitted fictional message; review/save a note; close/reopen; inspect the board and a recorded outcome; create another idea with the top button; inspect/copy the pitch. Confirm saved ideas and key remain available. This is a maintainer walkthrough, not a recruited reader study.
3. Review PR #1. When satisfied, mark it ready for review and merge it. This preparation has not merged it or changed repository settings. Keep issue #2 open until the installed-Sheet findings are verified.
4. Open the canonical reader link after merging and download the kit from the default branch. Confirm it contains the expected five Apps Script files and the update guide. Do not use a localhost URL or private Sheet URL in the newsletter.
5. Review the article/post in LinkedIn's editor, replace the launch post's draft instruction with the actual published article URL, then publish when ready. No post, email, subscription message, or announcement has been sent by this task.

Canonical reader URL after merge:

https://github.com/rtomboj/innovate-project-development-mode/tree/main/make-the-case

Current branch preview for review before merge:

https://github.com/rtomboj/innovate-project-development-mode/tree/make-the-case-prototype-20261027/make-the-case

The drafts must not describe the template as fully verified until the installed-account pass is completed. No public Google template copy, formal GitHub release, or hosted-service launch is included in this handoff.
