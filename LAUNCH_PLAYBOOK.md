# NEXO Launch Playbook

This playbook is for early public validation without tripping low-trust platform filters.

## What likely caused the Reddit block

The removed post had several risk signals at once:

- a very new Reddit account
- repeated posting of the same text
- product-style framing instead of discussion-style framing
- likely external-link intent too early
- little prior participation in the target community

That combination often gets auto-filtered before mods even review the post.

## Best posting strategy now

Do not lead with "I built X, try it here."

Lead with one concrete workflow pain:

- sharing Markdown with non-technical stakeholders
- turning release notes into approval-ready PDFs
- branding docs without manual formatting
- running Markdown to PDF from terminal or CI with the new CLI

Then position NEXO as the thing you built to solve that pain.

## Recommended channel order

1. GitHub

- Keep both repositories polished and easy to understand.
- Treat `nexo` as the main product repo and `nexo-cli` as the power-user companion.
- Make sure both READMEs cross-link each other cleanly.

2. LinkedIn

- Safer than Reddit for an initial launch.
- Use a short founder-style post with one real problem, one demo visual, and one link.
- Good place to validate wording before posting in communities with stricter anti-spam filters.

3. X or Bluesky

- Post a shorter version of the problem/solution angle.
- Use the demo video or a before/after image.

4. Reddit

- Only after warming up the account with genuine comments in relevant subreddits.
- Prefer text-first posts with no link in the body.
- Add the link later only if someone asks, or place it in a comment after the thread is live.

5. Hacker News

- Only when the repos, demo, and product page are all polished.
- Better angle: "Show HN: Markdown to branded PDF for stakeholder-facing docs"
- HN is more tolerant of launches than Reddit, but low-substance pitches still die fast.

## Best subreddit angle now

The safest angle is not "startup launch."

The safest angle is "workflow problem + what I learned."

Best candidate communities:

- `r/SideProject`
- `r/commandline`
- `r/devtools`
- `r/opensource`

`r/learnprogramming` is usually a weak fit. `r/startups` and `r/sidehustle` often have low conversion and higher spam sensitivity.

## How to frame NEXO now that `nexo-cli` exists

The product story is stronger if the web app and CLI are presented as one workflow:

- web app for quick conversions, branding, attachments, and easier first use
- CLI for terminal, scripts, CI, and repeated batch conversion

That makes the launch feel more complete and less like a thin wrapper.

## Recommended Reddit structure

Use this shape:

1. Start with the problem in one sentence.
2. Explain the specific workflow that kept failing.
3. Say you built a small tool for it.
4. Mention one or two implementation choices.
5. Ask for feedback on the workflow, not just on the product.

Avoid:

- "check it out"
- "link in comments" in the main body
- too many feature bullets
- posting the same copy across multiple subreddits
- posting twice from the same account within a short window

## Safer Reddit draft

Title:

`I got tired of turning Markdown docs into stakeholder-ready PDFs by hand, so I built a small tool for it`

Body:

`I write a lot of docs in Markdown: release summaries, architecture notes, short reports, internal handoff docs. Writing is easy. Sharing outside the engineering team is the annoying part.`

`Every time I needed to send one of these to leadership or clients, I ended up fixing formatting, exporting manually, or rebuilding the doc somewhere else just so it looked presentable.`

`So I built a small tool called NEXO to turn Markdown into cleaner PDF output. It started as a web flow, and now I also added a CLI so I can run it from terminal/CI for repetitive cases.`

`The interesting part for me was less the conversion itself and more making the output feel like something you can actually send to non-technical stakeholders without extra cleanup.`

`I’m still validating the idea, so I’d love feedback on the workflow itself: when you need to share Markdown with someone non-technical, what do you usually do today?`

Do not include the product URL in the body on the first attempt.

## Better HN draft

Title:

`Show HN: NEXO, convert Markdown into branded PDFs for stakeholder-facing docs`

Body:

`I often write release summaries, architecture notes, and reports in Markdown, but the final output usually needs to be shared with people outside the engineering team. That meant copying content elsewhere, tweaking formatting, or exporting manually every time.`

`I built NEXO to make that handoff easier: Markdown in, cleaner PDF out. There’s a web app for interactive use and a CLI for terminal/CI workflows.`

`Main repo: ...`

`CLI repo: ...`

`I’d especially love feedback on whether the problem resonates, and which kinds of docs you’d actually want to export this way.`

## Better LinkedIn draft

`Markdown is great for writing, versioning, and collaboration. It is much less great when the final audience is leadership, clients, or anyone outside the dev workflow.`

`I kept hitting the same friction: release notes, architecture reviews, and short reports started in Markdown, but the final step still involved manual cleanup before sharing.`

`So I built NEXO: a way to turn Markdown into cleaner, stakeholder-ready PDFs. I started with the web product and now added a CLI for terminal and CI workflows too.`

`Still early, but the problem feels very real. If your team writes docs in Markdown and then has to “repackage” them for sharing, I’d love to hear how you handle that today.`

## Practical anti-block rules for Reddit

- Spend a couple of days commenting before posting again.
- Post only once, not repeated retries with the same copy.
- Do not use the exact removed text again.
- Keep the first post text-only.
- Wait for engagement before dropping links.
- If you link anything, prefer GitHub first, not a waitlist page.
- If asked where to try it, send the main repo and mention the CLI separately.

## Best link destination by context

- Reddit: GitHub repo first
- Hacker News: GitHub repo first, then hosted product
- LinkedIn: hosted product first, GitHub in comments or second link
- Dev/tooling communities: whichever best matches the audience

## Recommended current positioning

Short version:

`Markdown to stakeholder-ready PDF, with web and CLI workflows.`

Longer version:

`NEXO turns Markdown docs into polished PDFs for release summaries, architecture reviews, client reports, and other stakeholder-facing workflows, with both a web app and a CLI.`

## What I would do next

1. Keep Reddit off the critical path for the next post.
2. Publish a polished LinkedIn post first.
3. Warm up Reddit with normal participation.
4. Repost later with a text-only discussion angle.
5. Use the CLI addition as proof that the workflow is broader than a simple landing-page tool.
