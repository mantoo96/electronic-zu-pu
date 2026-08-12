# Branches · Digital Family Tree

English | [简体中文](README.md)

An open-source, self-hosted digital family tree. It provides member profiles, relationship management, and an interactive family graph designed to run on a personal computer, home NAS, or private server.

## Features

- Member profiles with names, gender, dates, generation, occupation, location, phone, avatar, and biography
- Configurable family surname, seal text, family tree name, header subtitle, and generation poem
- Parent-child, spouse, sibling, adoptive-parent, guardian, and custom relationships
- A two-person kinship query with terms in both directions and a verifiable relationship path
- Regional kinship terms that can override standard terms while retaining the standard wording for reference
- Browse mode by default, with password-protected admin access for all edits, imports, and settings
- Full-tree and direct-line views; the direct-line view hides spouses outside the family line and lays generations out from left to right
- Automatic graph layout, zooming, panning, minimap, and member details
- JSON file persistence with browser-based backup import and export
- Node.js and Docker Compose deployment options
- Responsive desktop and mobile interfaces
- Simplified Chinese, Traditional Chinese, and English UI, selectable from Settings and remembered by the browser

## Technology

- Frontend: React 19, TypeScript, Vite, XYFlow, and Dagre
- Backend: Node.js, Express 5, and Zod
- Storage: a server-side JSON file with queued writes and atomic temporary-file replacement
- Deployment: Docker and Docker Compose

## Quick start

Node.js 20 or later is required.

```bash
npm install
ADMIN_PASSWORD='choose-a-password' SESSION_SECRET='choose-a-random-secret' npm run dev
```

Open [http://localhost:5173](http://localhost:5173). In development, Vite proxies `/api` requests to `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Docker deployment

Create your local environment file before the first deployment:

```bash
cp .env.example .env
```

Set the administrator password in `.env`, then generate a session secret:

```bash
openssl rand -hex 32
```

Copy the generated value into `SESSION_SECRET` and start the service:

```bash
docker compose up -d --build
```

The real `.env` file is ignored by Git. If no administrator password is configured, the service remains safely read-only and disables every mutation endpoint.

Open [http://localhost:3000](http://localhost:3000). Family data is stored in the `family-tree-data` Docker volume and survives container updates.

View logs or stop the service with:

```bash
docker compose logs -f
docker compose down
```

Running `docker compose down -v` also deletes the data volume permanently. Use it only when you intentionally want to erase the stored family tree.

## Administrator credentials

Each deployment supplies its own credentials. The project does not generate a shared administrator key.

| Environment variable | Purpose | Keep available? |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Password entered when switching from browse mode to admin mode | Yes; the deployer manages it |
| `SESSION_SECRET` | Random server-side key used to sign the administrator session; it is not a login password | Keep it stable, but it is not needed for daily sign-in |

For Docker Compose, these values normally live in the project's `.env` file:

```dotenv
ADMIN_PASSWORD=your-strong-admin-password
SESSION_SECRET=paste-the-output-of-openssl-rand-hex-32-here
```

People who clone the repository must create their own `.env`; they cannot use the repository maintainer's password. Neither credential is included in family-tree JSON exports.

To reset the password in a Docker deployment, update `ADMIN_PASSWORD` in `.env` and recreate the container:

```bash
docker compose up -d --force-recreate
```

Existing browser sessions can remain valid for up to 12 hours. To invalidate every current session immediately, generate a new `SESSION_SECRET` at the same time and recreate the container. Changing credentials does not delete family data.

## Language settings

Open **Settings** in the lower-left sidebar and select 简体中文, 繁體中文, or English. This preference is stored in the current browser and takes effect immediately; it is not written to the shared family-tree data.

Names, biographies, custom relationship labels, and other family-authored content are displayed exactly as entered. The interface and built-in relationship terms are localized.

## Demo data

After starting the app, sign in as an administrator and import [`examples/family-tree.sample.json`](examples/family-tree.sample.json) to view a fictional three-generation tree.

Generate and import the 50-person, five-generation demo:

```bash
npm run demo:generate -- --import
```

Generate and import the 80-person, nine-generation demo, spanning roughly 200 years:

```bash
npm run demo:generate-80 -- --import
```

Use `--port 3001` when the server is exposed on another port. Export or back up any real data before importing a demo because import replaces the current tree.

## Data and backups

When running directly on the host, the default data file is:

```text
apps/api/data/family-tree.json
```

Choose another path with an environment variable:

```bash
DATA_FILE=/srv/family-tree/data.json npm start
```

Use **Export backup** in the interface regularly, or back up the server-side file or Docker volume.

## Kinship queries

Select **Kinship** in the header, then choose two members in the graph. The app shows how each person addresses the other and displays the relationship path used to calculate the result.

Administrators can maintain regional forms of address under **Settings → Regional kinship terms**. A regional term is shown first in query results while the standard term remains visible. Custom terms are included in JSON imports and exports.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/auth/status` | Get the current admin-session status |
| `POST` | `/api/auth/login` | Sign in as an administrator |
| `POST` | `/api/auth/logout` | Exit admin mode |
| `GET` | `/api/family` | Read the complete family tree |
| `PATCH` | `/api/family` | Update family details and settings |
| `POST` | `/api/people` | Add a member |
| `PUT` | `/api/people/:id` | Update a member |
| `DELETE` | `/api/people/:id` | Delete a member and connected relationships |
| `POST` | `/api/relations` | Add a relationship |
| `DELETE` | `/api/relations/:id` | Delete a relationship |
| `POST` | `/api/import` | Import and replace the complete family tree |

All mutation endpoints require a valid administrator session. The read endpoint and authentication endpoints remain available in browse mode.

## Privacy and production security

Admin mode controls who can modify data; ordinary visitors can still read the complete family tree. When publishing real family data on the internet, place the app behind member authentication, a VPN, or a zero-trust gateway, and enable HTTPS.

Do not commit the data directory, real backups, phone numbers, dates, or other private family information to a public repository. `apps/api/data/*.json` is ignored by Git, while the files under `examples` contain fictional public demo data.

## Project structure

```text
.
├── apps
│   ├── api          # Express API and file storage
│   └── web          # React frontend and family graph
├── examples         # Fictional public demo data
├── compose.yaml
└── Dockerfile
```

## Commands

```bash
npm run dev      # Start the API and frontend development servers
npm run build    # Create a production build
npm test         # Run tests
npm run lint     # Run TypeScript checks
```

## License

[MIT](LICENSE)
