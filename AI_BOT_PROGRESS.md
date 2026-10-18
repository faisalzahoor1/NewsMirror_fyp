# NewsMirror AI News Assistant — Progress Log

Gemini-powered chatbot for the **Community Discussions** page. It answers questions **only** about the
scraped articles NewsMirror stores (MongoDB `newsmirror.articles`), gives details on a specific article
the user mentions, and refuses everything else.

## How to set your Gemini API key

1. Open `backend/.env` (it already has `SECRET_KEY`) and add these two lines:
   ```
   GEMINI_API_KEY=paste-your-key-here
   GEMINI_MODEL=gemini-3.8-flash
   ```
   ⚠️ `gemini-2.5-pro` (the code default) and `gemini-2.5-flash` are no longer available to new API keys (404),
   and Pro models have a free-tier quota of 0 (429). Use `gemini-3.8-flash` (or `gemini-flash-latest`).
2. Install the new backend packages (once):
   ```
   cd backend
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Restart the backend: `uvicorn app.main:app --reload`

Rules:
- **Never** put the key in `frontend/.env`. Anything starting with `VITE_` is shipped to every visitor's browser.
- `backend/.env` is now git-ignored, so the key will not be committed. Use `backend/.env.example` as the template for other machines.
- To use a different Gemini model, change `GEMINI_MODEL`. No code change is needed.

## Checklist

- [x] 0. Progress log created
- [x] 1. Secure the key (`backend/.gitignore`, untrack `backend/.env`, `.env.example`)
- [x] 2. Backend dependencies (`google-genai`, `requests`, `beautifulsoup4`)
- [x] 3. Config (`GEMINI_API_KEY`, `GEMINI_MODEL`, `articles_collection`)
- [x] 4. Bot backend (`BotSchema.py`, `BotController.py`, `BotRoutes.py`, router in `main.py`)
- [x] 5. Frontend bot panel in `Community.jsx`
- [x] 6. Verification (offline, with Gemini mocked; still needs a live test with your real key)
- [x] 7. Live API test with the real Gemini key (all 4 test questions pass; UI click-through is up to you)

## How the bot works

```
Community.jsx  --POST /api/community/bot/chat {message, history}-->  BotRoutes.py (login required)
                                                                          |
                                                                   BotController.chat_with_bot
                                                                          |
   1. load_articles()            scraped articles from MongoDB newsmirror.articles
                                 (falls back to scraper/*.json), cached 5 minutes
   2. find_relevant_articles()   matches the question to headlines by keywords or "article 3"
   3. fetch_article_body()       downloads the matched article pages for full text (cached)
   4. Gemini (GEMINI_MODEL)      strict system prompt: answer ONLY about these articles,
                                 otherwise reply with a fixed refusal message
   5. returns {reply, sources}   the frontend shows the reply plus clickable source links
```

Safeguards:
- **Off-topic refusal**: the system prompt makes Gemini return a fixed sentence for anything not about NewsMirror articles.
- **No made-up facts**: the bot answers only from the headline list and the fetched article text.
- **SSRF-safe**: only URLs already in the articles list are fetched, never URLs the user types.
- **Quota protection**: login is required, plus a limit of 15 messages per minute per user (HTTP 429).
- **Key safety**: the key lives only in `backend/.env`. If it is missing, the API returns 503 "AI assistant is not configured". The key is never logged or sent to the browser.

## Log

### 2026-10-18: Steps 0–6 completed
**Step 1, key security**
- Found that `backend/.env` was committed to git (since commit `f1c208c`). Ran `git rm --cached backend/.env`; the file stays on disk.
- Added `backend/.gitignore` (`.env`, `venv/`, `__pycache__/`) and `backend/.env.example` (placeholders only).
- ⚠️ The old `SECRET_KEY` value is still in git history. Change it to a new random value in `backend/.env`. Users will need to log in again afterwards.
- ⚠️ The deletion of `.env` from git is staged but **not committed** yet.

**Step 2, dependencies**: appended `beautifulsoup4==4.13.4`, `google-genai==1.20.0` and `requests==2.32.4` to `backend/requirements.txt`, keeping its UTF-16 encoding. Installed them in `backend/venv`.

**Step 3, config**: `config.py` now reads `GEMINI_API_KEY` and `GEMINI_MODEL` (default `gemini-2.5-pro`). `MongoConnection.py` gained `articles_collection`.

**Step 4, backend**: new `schemas/BotSchema.py`, `controllers/BotController.py` and `routes/BotRoutes.py`. `main.py` registers `BotRoutes.botRouter` at `/api/community`, giving the endpoint `POST /api/community/bot/chat`.

**Step 5, frontend** (only the AI bot panel of `pages/Community.jsx` changed):
- Real API call with JWT and the last 10 messages as history
- Login toast when logged out
- "Thinking…" bubble while waiting, with input and button disabled
- Auto-scroll
- Clickable "Sources" links under replies
- Red bubble for errors
- Updated greeting, subtitle and placeholder

**Step 6, verification**
- `/api/community/bot/chat` is registered. 58 scraped articles load from MongoDB.
- Matching: "discord outage" finds the Discord article, "Rihanna tattoo" finds the Rihanna article, "article 3" finds item 3, and "write a poem" finds nothing.
- Full-text fetch from geo.tv works.
- With no key, the endpoint returns 503 with a clear message.
- With Gemini mocked: correct history roles (user/model/user), article details included in the prompt, sources extracted from the reply, and the rate limit triggers 429.
- `vite build` succeeds. ESLint reports 1 error and 1 warning, both in the existing comments `useEffect`, not in bot code.
- **Not yet tested**: real Gemini responses and clicking through the UI. These need your key (step 7).

### 2026-10-18: Step 7, live test with the real key
Tested `POST /api/community/bot/chat` against the running backend with a local test user
(`bot-test@example.com`, created via `/api/user/register` in the `users` collection; delete it when no longer needed).

**Problems found and fixed**
1. **503 "not configured" although the key was in `.env`**: not a code bug. An old `uvicorn --reload` from
   2026-10-16 was still listening on 127.0.0.1:8000. Windows let a second server bind the same port, and
   requests went to the old one, which had loaded `.env` before the key was added. `--reload` only watches
   `.py` files, so editing `.env` never restarts it. Fix: stopped the old server (and an old Vite on 5173).
   **Always fully restart uvicorn after editing `.env`.**
2. **502 on every message, `ClientError` in the log**: `gemini-2.5-pro` returns 404 "no longer available to new
   users". `gemini-2.5-flash` also returns 404. `gemini-3.1-pro-preview` / `gemini-pro-latest` return 429 (free-tier quota
   limit 0). `gemini-3.8-flash` and `gemini-flash-latest` work. Fix: `GEMINI_MODEL=gemini-3.8-flash` in `backend/.env`.
3. **Bot fix (`BotController.py`)**: the error log only said `ClientError`, so failures could not be diagnosed.
   It now catches `google.genai.errors.APIError` and logs the model, HTTP code, status and message,
   with the key masked. A Gemini 429 (quota) now returns 503 "The AI assistant has reached its usage limit…"
   instead of the generic 502.

**Results (model `gemini-3.8-flash`)**

| Question | HTTP | Time | Result |
|---|---|---|---|
| What are the latest headlines? | 200 | 19.3s | ✅ 16 bullet headlines with geo.tv links; 5 sources returned |
| Tell me more about the Discord outage | 200 | 6.8s | ✅ 5-bullet summary from the full article text (Downdetector ~70k reports, app 57% / messaging 25% / login 13%, cause not yet given); 1 source (the Discord article) |
| Write me a poem | 200 | 2.1s | ✅ Exact refusal message, no sources |
| What is 2+2? | 200 | 4.7s | ✅ Exact refusal message, no sources |

Notes
- One headline link (`…/663151-beyounc`) looks truncated, but that is how the URL is stored in MongoDB (scraper data), not a bot error.
- The server log shows a harmless google-genai warning, "non-text parts in the response: ['thought_signature']". The reply text is still complete.
- Not changed (outside bot files): `config.py` still defaults `GEMINI_MODEL` to `gemini-2.5-pro`, and `.env.example`
  also lists it. Consider changing both to `gemini-3.8-flash` so a missing `GEMINI_MODEL` line doesn't break the bot.

## Step 7, your live test
1. Add the key to `backend/.env` as described at the top of this file. Make sure it goes on its **own new line**: the file currently has no newline at the end.
2. Run `uvicorn app.main:app --reload` in `backend/` and `npm run dev` in `frontend/`.
3. Log in, open Community, and try these:
   - "What are the latest headlines?" → a list of NewsMirror headlines
   - "Tell me more about the Discord outage" → a summary plus a source link
   - "Write me a poem" or "What is 2+2?" → *"I can only help with articles published on NewsMirror…"*
