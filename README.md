# Send · Climbing Training App

A mobile-first React app for a 16-week V6→V7+ climbing training plan. Week 1 starts **Mon 18 May 2026**.

Built with Vite + React. All training data is hardcoded. Progress saves to your phone's local storage. No accounts, no server, no tracking.

**Features:** today's session as hero · 16-week scrollable schedule with per-week edit (reorder days, switch 2/3 climbing-day weeks individually) · expandable exercises with how-to descriptions, target muscles, and per-exercise countdown timers · end-session flow that records actual minutes, difficulty 1–5, effort 1–5, and free-form notes · partial-completion indicator if you skip exercises · progress dashboard with stacked bar chart (auto-scaling), 16-week heatmap, per-phase bars · muscle-group exercise search · skill-coded pills for 8 categories.

---

## Deploy to Vercel — step by step

This guide assumes **zero technical experience**. You'll need about 15 minutes and a free account at GitHub and Vercel. Once deployed, your app will live at a permanent URL like `send-climbing.vercel.app`, and you can save it to your iPhone home screen so it behaves like a native app.

### What you'll do, in plain English

1. Put this folder on the internet (using GitHub).
2. Tell Vercel "build the website that's in that folder."
3. Open the URL on your iPhone, add it to your home screen.

That's it. The whole thing is free for personal use.

---

### Step 1 — Make a GitHub account (skip if you already have one)

1. Go to **https://github.com/signup** in your browser.
2. Enter an email, password, and pick a username. The username can be anything — it'll appear in your URL eventually but doesn't matter much.
3. Verify your email when GitHub sends you a code.

### Step 2 — Install GitHub Desktop (the easy way to upload files)

GitHub *can* be used from the command line, but you don't need that.

1. Go to **https://desktop.github.com** and download GitHub Desktop for Mac (or Windows).
2. Install it like any other app, then open it.
3. When it prompts you, **sign in with the GitHub account you just made**.
4. It might ask "Configure Git" — just click **Finish**. The defaults are fine.

### Step 3 — Create a new repository for this app

1. In GitHub Desktop, click **File → New Repository**.
2. Fill in:
   - **Name:** `climbing-training-app` (or whatever you like)
   - **Local path:** somewhere easy to find, like `~/Documents`
   - Leave the rest at defaults
3. Click **Create Repository**.

GitHub Desktop just made an empty folder on your computer. You're going to put this app's files inside it.

### Step 4 — Copy this app's files into that new repository folder

1. Open Finder (or File Explorer on Windows).
2. Find the folder GitHub Desktop just made — for example, `~/Documents/climbing-training-app`.
3. Open this app's folder (the one with this README inside it).
4. Select **everything** inside this app folder: `src/`, `public/`, `package.json`, `index.html`, `vite.config.js`, `.gitignore`, `README.md` — all of it.
5. **Copy** (Cmd+C / Ctrl+C) and **paste** (Cmd+V / Ctrl+V) into the empty `climbing-training-app` folder GitHub Desktop made.

Don't copy the folder itself — copy what's *inside* it, so the files land directly in `climbing-training-app/`.

### Step 5 — Publish the repository to GitHub

1. Switch back to GitHub Desktop. You'll see a long list of "changes" — those are the files you just copied.
2. At the bottom-left, where it says **Summary**, type something like `first commit` and click **Commit to main**.
3. At the top, click **Publish repository**. 
4. Uncheck **Keep this code private** if you want the simplest setup (Vercel works either way; private is fine too).
5. Click **Publish repository**.

Your app is now on GitHub. You can verify by going to `https://github.com/your-username/climbing-training-app` in your browser.

### Step 6 — Make a Vercel account

1. Go to **https://vercel.com/signup**.
2. Click **Continue with GitHub** (this links them together so the next step works).
3. Authorise Vercel to read your GitHub. Click **Authorize Vercel**.
4. Vercel may ask you a couple of setup questions — pick the **Hobby** (free) plan if asked.

### Step 7 — Deploy

1. Once logged into Vercel, click **Add New → Project** (top right).
2. You'll see a list of your GitHub repositories. Find **climbing-training-app** and click **Import** next to it.
3. Vercel will auto-detect that this is a Vite project. You should see:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build` (or `npm run build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   
   Leave all of that alone — it's already correct.
4. Click **Deploy**.

Wait about 60 seconds. You'll see a build log, then a fireworks animation, then a screenshot of your app.

### Step 8 — Open your app on your iPhone and save to home screen

1. On Vercel, click **Visit** or **Dashboard → climbing-training-app → Domains** to find your URL. It looks like `climbing-training-app-xxxx.vercel.app`.
2. Email or AirDrop the URL to yourself, or just type it into Safari on your iPhone.
3. In Safari, tap the **share button** (square with an arrow pointing up) at the bottom of the screen.
4. Scroll down and tap **Add to Home Screen**.
5. Edit the name if you want (it'll default to "Send"). Tap **Add**.

You now have an icon on your home screen. Tap it — it opens full-screen with no Safari chrome, like a native app.

---

## When you want to make changes later

If you ever edit the code (or I edit it for you), the workflow is:

1. Open GitHub Desktop.
2. You'll see the changed files listed.
3. Type a summary at the bottom (`updated week 4 exercises`, anything you like).
4. Click **Commit to main**, then **Push origin**.
5. Vercel sees the push automatically and rebuilds. Your live URL updates in about a minute.

You don't need to touch Vercel again after the first deploy.

---

## Running it on your computer first (optional)

If you want to preview the app on your laptop before deploying:

1. Install **Node.js** from **https://nodejs.org** (pick the "LTS" version — left button).
2. Open Terminal (Mac) or PowerShell (Windows).
3. Type these commands one at a time, pressing Enter after each:

```
cd ~/Documents/climbing-training-app
npm install
npm run dev
```

4. Open the URL it prints (something like `http://localhost:5173`) in your browser.
5. To stop it, press Ctrl+C in the terminal.

This isn't required to deploy — Vercel does all the building for you. It's just useful if you want to see the app before pushing it live.

---

## What's where in the code

If you want to tweak things:

- **`src/data.js`** — every week, every session, every exercise. This is where the training plan lives.
- **`src/styles.css`** — colours and visual styling.
- **`src/App.jsx`** — the actual screens.
- **`public/manifest.webmanifest`** — controls how the app appears when saved to home screen.

To change a colour palette value, edit the `:root` block at the top of `styles.css`.

---

## Troubleshooting

**"My app's URL just shows a Vercel error page."**  
Open the build log on Vercel — it tells you exactly what went wrong. Usually it's a file that didn't get copied. Make sure `package.json` and `index.html` are at the *top level* of your GitHub repository (not inside another folder).

**"I added it to my home screen but nothing happened."**  
The PWA install only works in **Safari** on iOS. Other browsers (Chrome, Firefox on iPhone) can't add to home screen with the standalone behaviour.

**"My progress disappeared."**  
Progress is saved in your phone's local storage. If you cleared Safari data or removed the app from your home screen, it's gone. The plan itself is rebuilt fresh each time from the hardcoded data — only your tick marks are stored.

**"Can I use this on multiple devices?"**  
The app works on any device that opens the URL, but progress is per-device. There's no cloud sync — that would require accounts and a server.

---

## License

This is your personal training app. Do whatever you like with it.
