# TechVyro — Netflix-Style Streaming Website

## Project Overview
A Netflix-style movie and TV show streaming website built with **Next.js 16 App Router**, **React 19**, **Tailwind CSS v4**, and the **TMDB API**. Supports movies, TV shows, search, watchlist, genre filtering, and embedded video playback via multiple streaming servers.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui, next-themes
- **Data**: TMDB API (server-side, `TMDB_API_KEY` env secret)
- **Package Manager**: npm
- **Port**: 5000 (dev: `next dev -p 5000 -H 0.0.0.0`)

## Architecture
- `app/` — Next.js App Router pages (server components)
- `app/api/` — API routes (search, genre discovery, trailer key)
- `components/` — Client components
- `lib/tmdb.ts` — TMDB API helpers (server-side only)
- `lib/streaming-servers.ts` — Video embed URL helpers

## Key Features
- **Dark/Light Mode Toggle** — next-themes based, toggle button in navbar, persists to localStorage
- **Hero Banner** — Auto-slides with progress bar; "Watch Trailer" button (lazy TMDB video fetch → TrailerModal); Play + More Info buttons
- **Genre Filter** — Scrollable genre pills on Movies & TV Shows pages with live filtering; Advanced Filters panel (Sort By, Year, Min Rating); Load More pagination
- **Language Filter** — Browse movies/TV by original language (14 languages)
- **Continue Watching** — localStorage-based watch history row on homepage; saved when Play is clicked on detail pages
- **Watch History Page** — Full watch history at `/history` with filter (All/Movies/TV), remove individual items, clear all
- **Search Modal** — Advanced filters: type (movie/TV/all), era, minimum rating; recent searches in localStorage
- **Watchlist (My List)** — Add/remove via localStorage `myList` key
- **Video Player** — Embedded iframe player with multiple streaming server fallback; Picture-in-Picture/Mini Player mode (minimize to floating corner window)
- **Similar Content** — "More Like This" section on movie/TV detail pages
- **Top 10 Lists** — Netflix-style numbered rank badges on Trending rows
- **User Reviews** — TMDB reviews with Load More on movie/TV detail pages
- **User Ratings** — Star rating (1–5) per movie/TV show saved to localStorage
- **Trailer Modal** — YouTube trailer playback on movie/TV detail and hero banner
- **Collections/Franchises** — 16 popular franchises at `/collections`; individual pages at `/collection/[id]`
- **Actor/Person Pages** — Full bio, birthday, filmography at `/person/[id]`
- **WhatsApp Popup** — sessionStorage-gated, shows once per session after 4s delay
- **Mobile Bottom Nav** — Fixed bottom navigation: Home, Movies, TV, My List, History
- **PWA** — Web App Manifest with shortcuts, theme color, apple-web-app metadata

## localStorage Keys
- `myList` — watchlist items
- `watchHistory` — continue watching items (max 20)
- `recentSearches` — last 8 search queries
- `streaming_server_stats` — per-server reliability stats
- `custom_streaming_servers` — user-added servers
- `userRatings` — per-content star ratings

## API Routes
- `GET /api/search?query=` — TMDB multi-search
- `GET /api/genre?genreId=&type=movie|tv&sortBy=&year=&minRating=` — TMDB genre/discover with advanced filters
- `GET /api/trailer?id=&type=movie|tv` — Returns YouTube trailer key for a movie/TV show

## Environment Secrets
- `TMDB_API_KEY` — Required, from themoviedb.org

## Pages
- `/` — Home with hero, continue watching, genre rows
- `/movies` — Movies with genre filter pills + advanced filters
- `/tv-shows` — TV Shows with genre filter pills + advanced filters
- `/movie/[id]` — Movie detail + video player + reviews + similar
- `/tv/[id]` — TV show detail + video player + episode guide
- `/my-list` — Saved watchlist
- `/new-popular` — New & popular content
- `/history` — Full watch history with filters
- `/collections` — Movie franchises/collections
- `/person/[id]` — Actor/person pages
