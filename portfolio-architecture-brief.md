# Portfolio Architecture Brief

This document defines the content structure and information architecture for Ahmad Saifullah Arifin's Windows XP-inspired portfolio. It is intended to be used as implementation guidance for an agent or development workflow. The portfolio should preserve the desktop metaphor while making professional work, experiments, and writing clearly distinct [file:17][file:18][file:1][file:19].

## Core principle

The portfolio should behave like a small operating system rather than a conventional scrolling website. Each major section should feel like a file, folder, or application window inside the Windows XP world, while still remaining easy for recruiters, clients, and technical visitors to understand [file:17][file:18].

The content should be split into three clear layers:

- Personal story: how the journey into software happened.
- Professional proof: real company, client, and production work.
- Curiosity layer: experiments, motion studies, hobby builds, and writing.

## Recommended desktop structure

Use the desktop as the main navigation surface. The primary items should be:

- `My_Journey.doc`
- `Profile.doc`
- `Experience.xls`
- `Projects.xls`
- `Playground/`
- `Articles/`
- `Latest_Resume_Saiful.pdf`

Optional utility or flavor items can remain for atmosphere, such as Winamp, Calculator, Internet Explorer, Sticky Notes, or My Computer, but they should not compete with the primary navigation path [file:17][file:18].

## Recommended user flow

The ideal visitor path should be:

1. Open `My_Journey.doc` to understand the personal story.
2. Open `Experience.xls` to verify work history and technical background.
3. Open `Projects.xls` to inspect real delivered work.
4. Open `Playground/` to explore experiments and creative technical play.
5. Open `Articles/` to read technical or reflective writing.
6. Download `Latest_Resume_Saiful.pdf` for the formal CV [file:1].

This structure keeps the desktop playful without making the professional content hard to find [file:17][file:18].

## File definitions

### `My_Journey.doc`

Purpose: narrative and identity.

This file should contain the personal timeline: early curiosity with computers, Joomla and website maintenance, Arduino hobby years, aerospace studies, the pivot after Covid, reskilling, and the current mindset. It should remain emotional, reflective, and story-led, rather than becoming a duplicate of the resume [file:1].

Suggested tone:

- warm
- thoughtful
- polished
- personal but not overly dramatic

### `Profile.doc`

Purpose: compact personal introduction.

This file should contain a short personal profile with:

- name
- role/title
- location
- current focus
- strongest technologies
- short paragraph on working style
- contact links

This page should be concise and act like a quick orientation file for visitors.

Suggested positioning statement:

> A systems-minded full-stack engineer building practical software across web platforms, operational tools, AI-assisted workflows, mapping interfaces, and connected-device systems, with an engineering mindset shaped by aerospace studies and hands-on problem solving [file:1][file:19][file:20].

### `Experience.xls`

Purpose: structured professional record.

This file should present career facts in a recruiter-friendly format, ideally styled like Excel with sheets or tabs.

Recommended sheets:

- `Work`
- `Education`
- `Certificates`
- `Stack`

Suggested `Work` rows:

| Period | Role | Organization | Notes |
|---|---|---|---|
| May 2023 - Present | Full Stack Engineer | Technerve Technology Solutions Sdn. Bhd. | Full-stack delivery, SDD work, Agile development, bug fixing, system integration, TerraAgra, Inerva products, inspection and operational tools [file:1] |
| Oct 2020 - Apr 2023 | IT Engineer | Avialite Sdn. Bhd. | Wireless monitoring systems, remote workstation system, Gateway GSM Android app, Odoo automation, IoT work, AWS Odoo deployment [file:1][file:20] |
| Dec 2018 - Oct 2020 | Farm Manager | Fatihin KC Farm | Operational management, procurement, site maintenance, approvals and compliance work [file:1][file:20] |
| Aug 2016 - Oct 2016 | Trainee Engineer | Indonesian Aerospace | Cross-department delivery support, verification, documentation, operational support [file:1][file:20] |

Suggested `Education` rows:

- Degree in Aerospace Engineering, Universitas Nurtanio Bandung [file:1][file:20]
- UNNUR Aero Maintenance Training Center [file:1][file:20]

Suggested `Certificates` rows:

- AirAsia Academy Software Engineer Full Reskilling Programme [file:1]
- A1 Indonesia Airframe basic license [file:1]
- A4 Indonesia Turbine Engine basic license [file:1]

Suggested `Stack` categories:

- Backend: PHP, Laravel, Node.js, Spring Boot [file:1]
- Frontend: React, Vue, JavaScript, ES6, Tailwind CSS, Bootstrap, Vuetify [file:1][file:19]
- Data: MySQL, MSSQL, MongoDB [file:1]
- AI and cloud: Vertex AI, Google Cloud Vision, Google Document AI, AWS EC2 [file:1]
- Other: Python, Tkinter, Arduino, Odoo, XMLRPC, Mapbox [file:1][file:19]

### `Projects.xls`

Purpose: primary showcase of professional work.

This file should contain company, client, and production-facing work. It should not mix true experiments with professional delivery.

Important classification rule:

- If the work was built as part of company tasks, client delivery, internal systems, or production operations, it belongs in `Projects.xls`.
- If the work was built mainly to explore an idea, learn a tool, or experiment for fun, it belongs in `Playground/`.

Because of this rule, the following should be treated as professional work rather than side projects:

- iMS MP Kangar [file:19]
- JPS NPIS [file:19]
- Inerva Manpower [file:19]
- Inerva Inspect [file:19]
- Inerva CCU [file:19]
- TerraAgra [file:19]
- MuslimCareMalaysia [file:19]
- OMS Event [file:19]
- GSM Web Based Wireless Alarm Monitoring / WAM-IRHAM [file:19]
- AROWS [file:19]
- Intern Centre [file:19]
- Gateway GSM, if it was part of company responsibility rather than a personal experiment [file:1][file:19][file:20]
- LoTUS, if it was part of R&D or company work rather than hobby work [file:1][file:19][file:20]
- OdooPush, if framed as operational business software rather than a casual toy [file:19]

Recommended featured professional projects:

| Project | Why feature it |
|---|---|
| TerraAgra | Strong agritech story, satellite/drone imagery, field monitoring, mapping, dashboard value [file:19] |
| Inerva Manpower | Good example of workflow, platform logic, AI integrations, maps, and role-based dashboards [file:19] |
| Inerva Inspect | Strong UI/UX and document workflow angle with drag-and-drop and autosave [file:19] |
| Inerva CCU | Strong operational asset tracking and certification monitoring story [file:19] |
| iMS MP Kangar | Shows approval logic, public-sector complexity, and full-stack integration [file:19] |
| JPS NPIS | Demonstrates government workflow systems and iterative approval structures [file:19] |
| WAM-IRHAM | Strong monitoring, mapping, failure detection, and operational response system [file:19] |
| AROWS | Good internal productivity and team operations product [file:19] |

Suggested columns for `Projects.xls`:

- Project
- Domain
- Tech stack
- Role
- Core challenge
- Key capabilities
- Status or year

### `Playground/`

Purpose: true experiments, motion tests, and curiosity-driven work.

This should be a folder, not a single page. When the user opens the folder, they should see multiple files inside it, reinforcing the Windows XP metaphor [file:17][file:18].

This folder should contain:

- GSAP experiments
- animation demos
- interaction studies
- small visual toys
- hobby hardware builds
- curiosity-driven prototypes
- Plane Code
- Arduino jam azan project

Possible file examples:

- `window-jiggle-demo.html`
- `text-reveal-gsap.html`
- `mouse-trail-test.html`
- `card-stack-animation.html`
- `plane_code.exe`
- `jam_azan_arduino.txt`
- `weird_ideas.txt`

Recommended interaction model:

- `.html` files open in an Internet Explorer-like browser window.
- `.txt` files open in a Notepad or Word-style lightweight reader.
- `.exe` files can open a modal, fake installer, or detailed project window.

This folder should feel playful and exploratory, but it should not dilute the professionalism of the main project showcase.

### `Articles/`

Purpose: dynamic writing archive backed by Cloudflare D1.

This should be a folder that looks like a file directory containing articles. Each article should visually appear as a file entry. Clicking a file should open the article in an application window, preserving the desktop metaphor.

Good article types:

- technical notes
- engineering writeups
- architecture decisions
- project retrospectives
- thought pieces
- short essays

Recommended opening behavior:

- technical articles open in an Internet Explorer-style reader
- reflective essays can open in a Word-style document reader
- small notes or drafts can open in a Notepad-like window

## Recommended data model for articles

Do not rely on literal static file generation for the user experience unless needed for deployment. The UI only needs to look like a folder of files. The underlying records can be stored in D1 and rendered dynamically.

Suggested D1 tables:

### `articles`

| Column | Type | Purpose |
|---|---|---|
| `id` | integer | primary key |
| `slug` | text | unique route key |
| `title` | text | file/article title |
| `category` | text | grouping or badge |
| `excerpt` | text | folder preview or summary |
| `content_html` | text | rendered article content |
| `icon_type` | text | file icon style if needed |
| `published` | integer/boolean | publish state |
| `created_at` | text | creation timestamp |
| `updated_at` | text | last updated timestamp |

### `comments`

| Column | Type | Purpose |
|---|---|---|
| `id` | integer | primary key |
| `article_id` | integer | foreign key to article |
| `author` | text | display name |
| `content` | text | comment body |
| `status` | text | moderation state |
| `created_at` | text | timestamp |

## Article UX rules

The article system should behave like this:

1. Open `Articles/` folder.
2. Fetch article records from D1.
3. Render each article as a file row or icon inside the folder view.
4. On click, open the article in an app-like window.
5. Load comments from D1 or JSON API output.
6. Show metadata such as title, category, and date inside the article window.

This approach keeps the retro metaphor intact while allowing content to scale over time.

## Suggested visual behavior for articles

Inside the `Articles/` folder, show:

- file name
- date
- category
- maybe a small file type indicator

Inside the opened article window, show:

- title
- category
- publish date
- content body rendered from stored HTML
- comments section sourced from structured data

Optional enhancement ideas:

- sort by date or category
- folders inside `Articles/` such as `Technical`, `Notes`, or `Essays`
- file icons that differ by category
- XP-style details view and icon view toggles

## Content classification rules

Use the following logic when deciding where a piece of content belongs:

### Professional work

Put in `Projects.xls` if it was:

- built for a company
- built for a client
- built for internal business operations
- deployed or intended for production use
- part of formal R&D or operational delivery

### Playground material

Put in `Playground/` if it was:

- built mainly to explore an idea
- an animation or interaction study
- a hobby electronics build
- a curiosity-driven prototype
- not primarily client or company delivery

### Writing

Put in `Articles/` if it was:

- a technical writeup
- project reflection
- architecture thought
- engineering note
- essay or commentary

## Positioning summary

The portfolio should present Ahmad as a systems-minded full-stack engineer whose work spans workflow-heavy web platforms, mapping, agritech, AI-assisted features, operational tools, and connected-device systems, while also making room for experimentation and thoughtful writing [file:1][file:19][file:20].

The site should feel nostalgic and playful on the surface, but the underlying information architecture should be disciplined and easy to understand. The retro presentation is the shell; the content structure must stay professional.
