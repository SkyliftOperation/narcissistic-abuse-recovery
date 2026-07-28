# Narcissistic Abuse Recovery — Landing Page

A single-page landing site dedicated to narcissistic abuse recovery coaching for
Alejandra Festinger, built to match the branding of
[codependencylifecoach.com](https://codependencylifecoach.com/).

## Brand system

Colours and typography were sampled directly from the live site.

| Token | Value | Used for |
| --- | --- | --- |
| `--navy` | `#162D4A` | Dark sections, header mark |
| `--navy-2` | `#273252` | Headings |
| `--navy-deep` | `#001E42` | Footer |
| `--rose` | `#D54B96` | Primary CTA, accents |
| `--blush` | `#F1BABF` | Rules, badges, quote marks |
| `--blush-bg` | `#FCE7EC` | Soft pink panels |
| `--mist` | `#F4F7FA` | Light panels |
| `--mint` | `#F2F8F5` | FAQ background |
| `--cream` | `#FFF2E2` | Alternating pillar panels |

Typefaces: **EB Garamond** (headings) and **Open Sans** (body) — the same pairing
as the main site.

## Structure

```
index.html          markup for the whole page
assets/styles.css   design system + layout
assets/script.js    scroll reveals, sticky header, FAQ accordion
images/             photography pulled from the main site
vercel.json         clean URLs, cache and security headers
robots.txt
```

No build step and no dependencies — it is plain static HTML/CSS/JS.

## Local preview

Any static server works:

```bash
npx serve .
```

## Deploying

Deployed on Vercel as a static project (framework preset: **Other**, no build
command, output directory: repository root). Pushing to `main` triggers a
production deploy; any other branch gets a preview URL.

## Conversion points

Every call to action points at the existing booking flow:

- Free 20-minute intro call → `https://calendly.com/cleofestinger/call`
- Phone → `720-604-0668`

The page deliberately ships **no email capture form**, because there is no
mail provider connected yet. When one is chosen (Formspree, ConvertKit, Klaviyo,
Mailchimp), a "free book excerpt" section can be added below the FAQ and wired
to it.

## Caching

Asset filenames carry no content hash, so `vercel.json` makes `/assets/*`
revalidate on every request — otherwise a returning visitor could pair a
cached stylesheet with freshly deployed HTML. Unchanged files still return a
304, so the cost is negligible. If a build step that fingerprints filenames is
ever added, switch these back to a long `immutable` cache.

## Notes

- Copy is adapted from the main site so the two read as one brand.
- A crisis-support disclaimer sits in the footer: coaching is not therapy, with
  the 988 Lifeline and National Domestic Violence Hotline listed.
- Respects `prefers-reduced-motion`; all animation is disabled for users who
  ask for it.
