# mi feed

My own video page. It shows the newest videos from channels I chose, sorted into tabs, plays them with YouTube's official player, and stops when the video ends. No sidebar, no autoplay, no Shorts.

Live at **https://anapalaciosrm.github.io/mi-feed/**

## How it works

* `channels.json` lists the tabs and the channels in each one.
* Twice a day (about 6am and 6pm Pacific) a GitHub Action reads each channel's public feed, drops Shorts and anything below the tab's `minMinutes`, and saves the result to `data/videos.json`. Any edit pushed to `main` also triggers an update.
* `index.html`, `app.js` and `style.css` are the site. Everything you do on it (watched, saved, hidden, boosted channels) is kept in your browser.

## The algorithm

Each video gets a score:

* **Freshness.** Its score halves every 2 days on News, 7 days on most tabs, 21 days on Discover.
* **More from this channel** (the button after a video ends) multiplies that channel by 1.6.
* **Already watched** drops a video to the bottom (×0.15).
* **Discover** gets a daily shuffle, so it changes each day but stays put within a day.
* No channel appears more than twice in a row.

## Changing channels

Open `channels.json` on GitHub, click the pencil, and add a handle like `"@veritasium"` to a tab. Save. The site updates in about 2 minutes. If a handle can't be found, it shows up at the bottom of the site under "Channels that need a fix".

## YouTube search

Full search uses the free YouTube Data API (about 100 searches a day). The key goes in `config.js`.

1. Go to https://console.cloud.google.com, create a project, and enable **YouTube Data API v3**.
2. Credentials, Create credentials, API key.
3. Edit the key: under Application restrictions choose **Websites** and add `https://anapalaciosrm.github.io/*`. Under API restrictions choose **YouTube Data API v3**.
4. Paste it into `config.js` as `apiKey`.

Optional: a second key with only the API restriction, saved as a repository secret named `YT_API_KEY`, makes the twice daily update faster. It works without one.
