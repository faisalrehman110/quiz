# Faisal Love Orbit Site

A completely rebuilt two-page static website for GitHub Pages.

## Pages

- `index.html` — split editorial layout with the question
- `yes.html` — a separate full-screen confirmation page

## No-button interaction

The No button:

- starts in the correct visible position beside Yes
- stays inside the answer area
- remains visible at all times
- moves smoothly away from the cursor
- avoids overlapping the Yes button
- works with mouse, touch, and keyboard focus attempts

## GitHub Pages

Upload the complete folder to a repository, then enable GitHub Pages from:

`Settings → Pages → Deploy from branch`


## Full-page runner update

The No button is converted to a fixed viewport-level element after page load.
It can move across the complete browser viewport rather than staying inside
the answer box. A large repulsion radius makes it move before the cursor
reaches it.
