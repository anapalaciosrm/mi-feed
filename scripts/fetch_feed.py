#!/usr/bin/env python3
"""Builds data/videos.json from the channels listed in channels.json.

Uses each channel's public YouTube RSS feed (no key needed). Video lengths
come from the YouTube API when YT_API_KEY is set, otherwise from the watch page.
"""
import json
import os
import random
import re
import sys
import time
import urllib.error
import datetime as dt
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHANNELS = os.path.join(ROOT, "channels.json")
OUT = os.path.join(ROOT, "data", "videos.json")
CACHE = os.path.join(ROOT, "data", "cache.json")
API_KEY = os.environ.get("YT_API_KEY", "").strip()
MAX_AGE_DAYS = 120
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}
CHANNEL_ID = re.compile(r"UC[\w-]{22}")


def get(url, timeout=25, tries=5):
    # YouTube's feeds randomly answer 404 or 5xx to cloud servers; trying again usually works.
    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={
            "User-Agent": UA,
            "Accept-Language": "en-US,en;q=0.8",
            "Cookie": "CONSENT=YES+1; SOCS=CAI",
        })
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (404, 429, 500, 502, 503):
                raise
        except (urllib.error.URLError, TimeoutError) as exc:
            last = exc
        time.sleep(1.5 * (attempt + 1) + random.random())
    raise last


def load(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def api(path, **params):
    params["key"] = API_KEY
    data = json.loads(get("https://www.googleapis.com/youtube/v3/" + path + "?" + urllib.parse.urlencode(params), tries=3))
    if "error" in data:
        raise ValueError(data["error"].get("message", "API error"))
    return data


def resolve(entry, cache):
    entry = entry.strip()
    if CHANNEL_ID.fullmatch(entry):
        return entry
    if entry in cache["handles"]:
        return cache["handles"][entry]
    handle = entry if entry.startswith("@") else "@" + entry
    if API_KEY:
        items = api("channels", part="id", forHandle=handle).get("items", [])
        if not items:
            raise ValueError("no YouTube channel with this handle")
        cache["handles"][entry] = items[0]["id"]
        return items[0]["id"]
    html = get("https://www.youtube.com/" + urllib.parse.quote(handle, safe="@"))
    patterns = (
        r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"',
        r'"externalId":"(UC[\w-]{22})"',
        r'feeds/videos\.xml\?channel_id=(UC[\w-]{22})',
    )
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            cache["handles"][entry] = m.group(1)
            return m.group(1)
    raise ValueError("no channel ID on page")


def read_feed(cid):
    root = ET.fromstring(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"))
    title = root.findtext("a:title", default="", namespaces=NS)
    videos = []
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        if not vid:
            continue
        link = e.find("a:link", NS)
        href = link.get("href", "") if link is not None else ""
        stats = e.find("media:group/media:community/media:statistics", NS)
        desc = e.findtext("media:group/media:description", default="", namespaces=NS)
        videos.append({
            "id": vid,
            "title": e.findtext("a:title", default="", namespaces=NS),
            "channelId": cid,
            "published": e.findtext("a:published", namespaces=NS),
            "views": int(stats.get("views", "0") or 0) if stats is not None else None,
            "desc": " ".join(desc.split())[:240],
            "short": "/shorts/" in href,
        })
    return title, videos


def read_api(cid):
    """Newest uploads through the official API: 1 unit per channel."""
    data = api("playlistItems", part="snippet,contentDetails", playlistId="UU" + cid[2:], maxResults=15)
    videos, title = [], ""
    for it in data.get("items", []):
        sn = it["snippet"]
        title = title or sn.get("channelTitle", "")
        vid = it["contentDetails"].get("videoId")
        published = it["contentDetails"].get("videoPublishedAt") or sn.get("publishedAt")
        if not vid or sn.get("title") in ("Private video", "Deleted video") or not published:
            continue
        videos.append({
            "id": vid,
            "title": sn.get("title", ""),
            "channelId": cid,
            "published": published,
            "views": None,
            "desc": " ".join(sn.get("description", "").split())[:240],
            "short": False,
        })
    return title, videos


def iso_seconds(s):
    m = re.fullmatch(r"P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?", s or "")
    if not m:
        return None
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def durations_api(ids):
    out = {}
    for i in range(0, len(ids), 50):
        q = urllib.parse.urlencode({"part": "contentDetails", "id": ",".join(ids[i:i + 50]), "key": API_KEY})
        data = json.loads(get("https://www.googleapis.com/youtube/v3/videos?" + q))
        for item in data.get("items", []):
            out[item["id"]] = iso_seconds(item["contentDetails"].get("duration"))
    return out


def duration_page(vid):
    try:
        m = re.search(r'"lengthSeconds":"(\d+)"', get(f"https://www.youtube.com/watch?v={vid}"))
        return vid, int(m.group(1)) if m else None
    except Exception:
        return vid, None


def main():
    config = load(CHANNELS, None)
    if not config:
        sys.exit("channels.json is missing or not valid JSON")
    cache = load(CACHE, {})
    cache.setdefault("handles", {})
    cache.setdefault("durations", {})
    errors = []

    tabs_out = []
    handle_of = {}
    for tab in config["tabs"]:
        ids = []
        for entry in tab.get("channels", []):
            try:
                cid = resolve(entry, cache)
                ids.append(cid)
                handle_of.setdefault(cid, entry)
            except Exception as exc:
                errors.append(f"{entry}: {exc}")
                print(f"::warning::{entry}: {exc}")
        tabs_out.append({
            "id": tab["id"],
            "name": tab["name"],
            "minMinutes": tab.get("minMinutes", 0),
            "discover": bool(tab.get("discover")),
            "channelIds": ids,
        })

    previous = load(OUT, {})
    channels = {}
    videos = []
    unique = list(dict.fromkeys(cid for t in tabs_out for cid in t["channelIds"]))

    def job(cid):
        try:
            return cid, (read_api(cid) if API_KEY else read_feed(cid)), None
        except Exception as exc:
            return cid, None, exc

    with ThreadPoolExecutor(3) as pool:
        for cid, result, exc in pool.map(job, unique):
            if exc:
                errors.append(f"{handle_of.get(cid, cid)}: feed failed ({exc})")
                print(f"::warning::feed {handle_of.get(cid, cid)}: {exc}")
                old = [v for v in previous.get("videos", []) if v["channelId"] == cid]
                if old:
                    channels[cid] = previous.get("channels", {}).get(cid, {"title": "", "handle": handle_of.get(cid, "")})
                    videos.extend(dict(v, short=False) for v in old)
                continue
            title, vids = result
            channels[cid] = {"title": title, "handle": handle_of.get(cid, "")}
            videos.extend(vids)

    if not videos:
        print("::error::No videos fetched; keeping the previous feed.")
        sys.exit(1)

    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=MAX_AGE_DAYS)
    videos = [v for v in videos if not v["short"]
              and dt.datetime.fromisoformat(v["published"].replace("Z", "+00:00")) >= cutoff]

    known = cache["durations"]
    missing = [v["id"] for v in videos if v["id"] not in known]
    if missing:
        print(f"Looking up {len(missing)} video lengths ({'API' if API_KEY else 'watch pages'})")
        if API_KEY:
            try:
                known.update(durations_api(missing))
            except Exception as exc:
                print(f"! API lookup failed, falling back: {exc}")
        still = [vid for vid in missing if vid not in known]
        with ThreadPoolExecutor(8) as pool:
            for vid, secs in pool.map(duration_page, still):
                if secs is not None:
                    known[vid] = secs

    kept = []
    for v in videos:
        secs = known.get(v["id"])
        if secs is not None and secs <= 60:
            continue  # Shorts, and premieres that have not aired yet
        v["duration"] = secs
        v.pop("short", None)
        kept.append(v)
    kept.sort(key=lambda v: v["published"], reverse=True)

    current = {v["id"] for v in videos}
    cache["durations"] = {k: s for k, s in known.items() if k in current}

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({
            "updated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "tabs": tabs_out,
            "channels": channels,
            "videos": kept,
            "errors": errors,
        }, f, ensure_ascii=False, separators=(",", ":"))
    with open(CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1, sort_keys=True)
    print(f"::notice::Wrote {len(kept)} videos from {len(channels)} channels, {len(errors)} problems")


if __name__ == "__main__":
    main()
