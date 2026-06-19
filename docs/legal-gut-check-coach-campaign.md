# Legal Gut Check: OTP Coach Outreach Campaign

**Date:** 2026-05-18
**Prepared for:** David Steel
**Prepared by:** Claude (Conatus)
**Status:** Issue-spotting only. NOT legal advice.

> This is a structured risk map, not a legal opinion. I am not a lawyer.
> Its purpose is to make a 30-minute consult with a real attorney efficient
> and cheap. Hand the attorney the "Questions for an attorney" section plus
> the facts below, rather than asking them to "review the whole campaign."

## Bottom line

The campaign is not reckless. It has real, deliberate mitigations: a
non-affiliation disclaimer on every email and every profile page, a working
one-click takedown, a working unsubscribe, accurate (not fabricated) data,
and a scrape that touched only EOS Worldwide's public, opt-in directory
entries.

Realistic worst case is a **cease-and-desist letter from EOS Worldwide**
asking us to take the profile pages down and stop using their marks. A
damages lawsuit is possible but unlikely, and expensive for them to pursue
with an uncertain payoff. The individual coaches are low risk: the takedown
link handles anyone who objects.

There are two concrete defects to fix this week, and one genuine open IP
question worth an attorney's eye.

## What the campaign actually does (the facts)

1. **Scrape.** `scripts/scrape-eos-implementers.ts` pulled 903 EOS
   implementer records from EOS Worldwide's **public** WordPress REST API
   (`implementer.eosworldwide.com/wp-json/wp/v2/implementer`). No login, no
   auth, no access barrier. The site's robots.txt permits it. The scraper
   honored the 10-second crawl-delay and identified itself with an honest
   user-agent linking back to orgtp.com.
2. **Filter.** `scripts/import-eos-implementers.ts` **excluded the 242
   coaches who set EOS's own `hide_from_directory` flag.** Only the 661
   coaches EOS itself displays publicly received OTP profile pages. We only
   republished people who are already public on EOS's site.
3. **Profile pages.** For each of the ~661, OTP built a public page at
   `orgtp.com/expert/<slug>` showing: name, title ("EOS Implementer"),
   location, headshot photo, tagline, full bio prose, and key-point bullets,
   all reproduced from the EOS directory. Each page carries a non-affiliation
   disclaimer, stated more than once.
4. **Email.** ~190 coaches have been emailed so far, inviting them to claim
   or remove their profile. The email uses EOS / EOS Worldwide marks
   comparatively, carries a non-affiliation disclaimer, an unsubscribe link,
   and a takedown link.
5. **Removal.** `/takedown/<slug>` (24-hour unpublish) and `/unsubscribe`
   both work and do what the email promises. Verified live 2026-05-18.

## Risk areas

### 1. CAN-SPAM (US commercial email law): LOW, one fixable gap
Compliant on the hard parts: accurate from and subject lines, sender
identified, working unsubscribe, opt-outs honored. **Gap:** the coach email
footer has **no physical postal address.** CAN-SPAM requires one in every
commercial email. Trivially fixable (add Sneeze It's mailing address to the
template footer). Until it is fixed, every send is technically
non-compliant, though FTC enforcement against a small, otherwise-compliant
sender who fixes promptly is close to nil.

### 2. Trademark, EOS / EOS Worldwide marks: MODERATE
The emails and profile pages use EOS marks heavily. Using a trademark to
refer to the actual product, for comparison, is generally permitted
(nominative fair use), and non-affiliation disclaimers are present on both
the emails and the pages. Residual risk: EOS Worldwide decides the use
implies endorsement or rides their brand and sends a C&D. The disclaimers
are the right mitigation and they are in place. Worst case: C&D, then
comply.

### 3. Scraping / unauthorized access (CFAA): LOW
This is the claim people fear most, and on these facts it is the weakest.
The data came from a public, unauthenticated API; robots.txt permitted it;
the scraper was polite and identified. Recent law (hiQ v. LinkedIn, Van
Buren v. United States) holds that scraping publicly available data is not
"unauthorized access" under the CFAA. The hacking framing does not fit.

### 4. Terms of Use / breach of contract: MODERATE-LOW
Separate from the CFAA: EOS Worldwide's website Terms of Use may prohibit
scraping or commercial reuse of their content. "Browsewrap" terms (ones a
user never clicks to accept) are often weakly enforceable, but a ToU
violation is the cleanest claim EOS actually has. This is the real substance
behind any C&D they might send.

### 5. Copyright, bios and photos: MODERATE (the item to ask a lawyer about)
Names, titles, and locations are facts: not copyrightable, free to use. But
two things ARE copyrightable and were republished verbatim on commercial
pages:
- **Bio prose.** Each coach's own marketing copy. Copyright belongs to
  whoever wrote it (the coach, or EOS).
- **Headshot photos.** Reproduced from EOS's server. A photo has a copyright
  owner (often the photographer) and is also the coach's likeness.
The takedown link mitigates after the fact, but the material is live until
someone asks for removal. **This is the item most worth a specific attorney
question.**

### 6. Right of publicity / likeness: LOW-MODERATE
Using real people's names and photos to populate OTP's directory (a
commercial platform) without consent. Using names for a factual business
listing is low risk. Using their **photos** in a commercial directory is the
sharper edge, and it is state-law dependent. The one-click takedown is a
meaningful mitigation.

### 7. Defamation / false light: LOW
The email promises "no invented bio." Verified true: every bio is scraped
verbatim from EOS's directory (confirmed in `data/eos-implementers.json`),
nothing is fabricated. As long as that holds, this risk stays low.

### 8. Tortious interference: LOW
The emails pitch coaches to bring clients onto OTP and off Ninety / Bloom
Growth. Marketing a competing product is not interference. It would only
become an issue if we induced someone to breach an actual contract, which we
do not.

## Concrete defects to fix

1. **Add a physical postal address to the coach email footer.** CAN-SPAM
   requirement. One-line template edit. Recommend doing this before the next
   send of any kind.
2. **Correct the email's description of the profile page.** The email says
   the page contains "Name, headline, tier, location." The page actually
   also shows the coach's photo, full bio, and key points. "No invented bio"
   is true, but the email under-describes what we published. Fix: either
   trim the page to match the email's promise, or update the email to
   describe the page accurately.

## Questions for an attorney (the focused brief: hand them this)

1. We republished, on commercial profile pages, each coach's **bio prose and
   headshot photo** scraped from a competitor's public directory. Copyright
   exposure? Is one-click takedown-on-request sufficient, or do we need
   opt-IN consent before a profile goes live?
2. We use **EOS / EOS Worldwide** marks in comparative emails and on profile
   pages, with a non-affiliation disclaimer. Is our disclaimer wording and
   placement sufficient for nominative fair use?
3. EOS Worldwide's **website Terms of Use**: does scraping their public,
   unauthenticated API for commercial reuse create breach-of-contract
   exposure, even though robots.txt permits it and there is no auth barrier?
4. **Right of publicity**: using coaches' names and photos to populate a
   commercial directory without consent. Exposure across states, and does
   takedown-on-request cure it?
5. Is **"we built you a draft profile, claim or remove it"** a defensible
   model, or should profiles stay unlisted until the coach opts in?
6. Confirm the **CAN-SPAM** footer fix and that the unsubscribe flow meets
   the mechanism and 10-day requirements.

## What can be fixed immediately, on your word

- Add the postal address to the email footer (fixes defect 1).
- Fix the email / page description mismatch (defect 2).
- Produce an exact field-by-field list of what each live profile page shows,
  if the attorney wants it.

Note: 5 `@eosworldwide.com` test emails went out 2026-05-18. Nothing in this
review changes that. It is the same campaign and the same exposure profile.
