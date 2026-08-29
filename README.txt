STRUCTURAL VACANCY — MOVING OFF GROK
=====================================

WHAT THIS FOLDER IS
-------------------
  index.html    the entire site, self-contained (hero photo, fonts, market tape
                for all 17 markets baked in). This IS the website.
  og.jpg        social preview image, served at /og.jpg
  favicon.svg   browser tab icon
  robots.txt    tells search engines to index the site
  sitemap.xml   ditto

Upload ALL FIVE files to the root. Do not upload this README.

Nothing here depends on Grok, xAI, a database, a subscription, or Claude.
Once uploaded, the site runs itself forever.


WHAT CHANGED FROM THE GROK VERSION
-----------------------------------
Nothing visible. Same layout, same photo, same colors, same fonts, same market
figures, same market dropdown and sortable vacancy table.

Under the hood:
 - The Postgres database and server function are gone. The Q2 2026 CBRE figures
   are baked into the page. To update to Q3, ask Claude and drop in a new
   index.html.
 - The dead routes are gone. /desk, /about, and /desk/<slug> were redirects back
   to the homepage in the Grok build, so every "Open note" link bounced the
   reader to the top. The site is now honestly one page.
 - Added robots.txt and a sitemap, which the Grok build did not have.
 - Removed the Grok PWA scaffolding and the preview bridge.


STEP 1 — PUT THE DOMAIN ON CLOUDFLARE
--------------------------------------
structuralvacancy.com is registered at GoDaddy and is currently using GoDaddy
DNS (ns35 / ns36.domaincontrol.com) with an A record pointing at Grok's host.

1. dash.cloudflare.com > Add a domain > structuralvacancy.com > FREE plan.
2. Cloudflare scans the existing records. Continue.
3. It shows you TWO NAMESERVERS. Copy them.
4. GoDaddy > My Products > Domains > structuralvacancy.com > DNS >
   Nameservers > Change Nameservers > "I'll use my own" > paste Cloudflare's two.
   Save and confirm.
5. Leave the old A record alone for now. The live Grok site keeps serving
   until you change it in step 3 below. Nothing goes down.

Cloudflare emails you when the domain is active (5-60 min, up to 24h).


STEP 2 — UPLOAD THE NEW SITE (SAFE — NOTHING SWITCHES YET)
-----------------------------------------------------------
6. Cloudflare > Workers & Pages > Create > Pages tab > Upload assets.
7. Project name: structuralvacancy
8. Drag in the FIVE files (index.html, og.jpg, favicon.svg, robots.txt,
   sitemap.xml). Not the folder. Not a zip.
9. Deploy site.
10. Open structuralvacancy.pages.dev and check everything: hero photo loads,
    market dropdown switches all ten markets, the vacancy table sorts and its
    rows are clickable, footer is right. The real site is still live and
    untouched at this point.


STEP 3 — SWITCH THE DOMAIN OVER
--------------------------------
Only once step 2 looks correct.

11. In the Pages project > Custom domains > Set up a custom domain >
    structuralvacancy.com > Activate.
12. Repeat for www.structuralvacancy.com
13. Cloudflare > structuralvacancy.com > DNS > Records: delete the old
    A record pointing at 64.239.109.1. That was Grok.
14. Visit https://www.structuralvacancy.com

SSL is automatic. Nothing to configure.


STEP 4 — DON'T DELETE GROK YET
-------------------------------
Leave the Grok project alone for at least a week. If anything is wrong you can
point the A record back and be live again in minutes. After a week, delete it.


UPDATING LATER
--------------
Pages project > Deployments > Create new deployment > drag the new files in.
Live in about 20 seconds. Old deployments stay as one-click rollbacks.


KEEP A BACKUP
-------------
Save this folder somewhere you'll find it. index.html is the whole site.
