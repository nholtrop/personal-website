# Personal website of Niels Holtrop

A single page academic website. All content lives in plain text files in `content/`; a small script (`build.js`, no dependencies) turns them into the website in `public/`. GitHub rebuilds and publishes the site automatically after every change.

## Where things live

| What you want to change | File |
|---|---|
| Name, title, bio, interests, contact, profile links | `content/profile.yml` |
| Journal publications (with abstracts and links) | `content/publications.yml` |
| Work in progress, other publications, archived projects | `content/working-papers.yml` |
| Press, interviews, videos, podcasts, photos | `content/media.yml` |
| Courses | `content/teaching.yml` |
| Employment, education, grants, awards, service | `content/cv.yml` |
| Profile photo, images, audio, CV PDF | `static/img/`, `static/media/`, `static/` |
| Colours and layout | `static/style.css` |

## Common tasks

**Add a publication.** Open `content/publications.yml`, copy an existing entry (from `- title:` down to the end of its abstract), paste it at the top of `items:`, and edit the fields. Keep the indentation exactly as in the other entries (two spaces per level). Put titles that contain a colon between double quotes. `topics` takes one or more of `customer`, `health`, `retail`, `methods`.

**Add a publisher PDF.** Six months after an article first appears online, the publisher's version may be shared under the Taverne amendment (Article 25fa of the Dutch Copyright Act); open access articles under CC BY can be shared straight away. Copy the PDF to `static/papers/` and add it as the first link of the article in `content/publications.yml`:
```
      - label: PDF
        url: papers/your-file.pdf
```

**Add a media item.** Open `content/media.yml` and add an entry at the top. Each item gets a designed cover; pick its drawing with `motif:` (the options are listed at the top of the file). YouTube links get an embedded player automatically; it only loads when a visitor clicks play, so no YouTube cookies are set beforehand. For a photo, copy the image to `static/img/` and set `image: img/yourfile.jpg`.

**Add your profile photo.** Save a portrait (roughly 4:5, at least 600 px wide) as `static/img/profile.jpg`. Until then the page shows your initials.

**Add a CV PDF.** Save it as `static/cv.pdf` and set `cv_pdf: cv.pdf` in `content/profile.yml`.

Small edits can be made directly on github.com: open the file, click the pencil icon, change it and choose Commit changes. The site updates within a minute or two; progress is visible under the Actions tab.

## Preview on your own computer (optional)

With Node.js installed: `node build.js`, then open `public/index.html` in a browser.

## First time setup on GitHub

1. Create a new **public** repository on github.com (for example `website`). GitHub Pages is free for public repositories.
2. Upload these files, keeping the folder structure, including the hidden `.github` folder. The most reliable route is from a terminal in this folder:
   ```
   git init -b main
   git add .
   git commit -m "Initial website"
   git remote add origin https://github.com/<username>/website.git
   git push -u origin main
   ```
   With the web interface, drag the whole folder onto the "uploading an existing file" page; check afterwards that `.github/workflows/pages.yml` is present.
3. In the repository, open Settings > Pages and set Source to **GitHub Actions**.
4. Open the Actions tab and check that "Publish website" succeeds (rerun it once if it ran before step 3).

## Custom domain (nielsholtrop.nl at TransIP)

1. Verify the domain first: your GitHub profile Settings > Pages > Add a domain. GitHub gives a TXT record named `_github-pages-challenge-<username>`; add it at TransIP and click Verify.
2. In the repository, Settings > Pages > Custom domain: enter `nielsholtrop.nl` and save.
3. At TransIP, set these records (and remove the old `@` A record 94.124.122.6):

   | Name | Type | Value |
   |---|---|---|
   | `@` | A | 185.199.108.153 |
   | `@` | A | 185.199.109.153 |
   | `@` | A | 185.199.110.153 |
   | `@` | A | 185.199.111.153 |
   | `@` | AAAA | 2606:50c0:8000::153 |
   | `@` | AAAA | 2606:50c0:8001::153 |
   | `@` | AAAA | 2606:50c0:8002::153 |
   | `@` | AAAA | 2606:50c0:8003::153 |
   | `www` | CNAME | `<username>.github.io.` |

4. Once GitHub shows the DNS check as successful, tick **Enforce HTTPS** (this can take up to a day to become available). `www.nielsholtrop.nl` then redirects to `nielsholtrop.nl` automatically.
