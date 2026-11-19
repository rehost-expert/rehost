# rehost.expert

Website for rehost.expert: website rehosting, care, social media, WhatsApp summaries and AI consultations for small businesses.

Currently also served (hidden, noindex) at https://an-tigin.ie/rehost/ from the an-tigin-glengarriff.github.io repo.

- `index.html`: home page
- `business.html`: business examples (hospitality, builders, trades, etc.)
- `website-design.html`: website building and redesign
- `hospitality.html`: redirect to business.html#hospitality
- `style.css`, `app.js`, `favicon.svg`: shared assets
- `search-index.json`: client-side site search index
- `build_rehost.py`: generator that writes the pages and regenerates `search-index.json`

After changing page copy or services, run `python3 build_rehost.py` so the HTML and search index stay in step.
