# TEN Weather — Frontend & Backend (Short & Clear)

**Live demo (frontend):** [https://ten-weather.vercel.app/](https://ten-weather.vercel.app/)

A concise guide for running and deploying both parts of the project.

---

## Tech stack

* **Frontend:** React 18, Vite, Axios, Tailwind CSS
* **Backend:** Node.js, Express, Axios, (optional) MongoDB via Mongoose

---

## Quick start (local)

### Backend

```bash
cd backend
npm install
# dev (auto-reload)
npm run dev
# production-like
npm start
```

Default: `http://localhost:4000`.

Key backend endpoints:

* `GET /api/geocode?q=<query>`
* `GET /api/weather?lat=<lat>&lon=<lon>`
* `GET /_healthz`

### Frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

To preview production build:

```bash
npm run build
npm run preview
```

---

## Environment variables

### Backend (`backend/.env`)

* `PORT` (optional)
* `MONGODB_URI` (optional) — MongoDB Atlas connection string
* `FRONTEND_URL` — comma-separated allowed origins for CORS (e.g. `http://localhost:5173,https://ten-weather.vercel.app`)

Example:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.../tenweather
FRONTEND_URL=http://localhost:5173,https://ten-weather.vercel.app
```

### Frontend (`frontend/.env.local` or Vercel env)

* `VITE_API_BASE_URL` — full backend base URL used by the frontend (include `/api` if the code assumes it):

```
VITE_API_BASE_URL=https://tenweatherbackend.onrender.com/api
```
                      
