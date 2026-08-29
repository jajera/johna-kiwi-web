#!/usr/bin/env node
// Renders the Labs and Writing card grids into index.html.
//
// Each feed is read from a remote URL when the matching env var is set, and
// falls back to the committed snapshot in data/ otherwise. A remote that is
// unreachable, slow, or malformed always degrades to the snapshot rather than
// failing the build.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FETCH_TIMEOUT_MS = 8000;
const LAB_COUNT = 3;
const POST_COUNT = 3;

const feeds = {
  labs: { env: "CATALOGUE_URL", snapshot: "data/catalogue.json" },
  posts: { env: "POSTS_URL", snapshot: "data/posts.json" }
};

function isValid(doc) {
  return doc && Array.isArray(doc.items) && doc.items.length > 0;
}

async function load(name) {
  const { env, snapshot } = feeds[name];
  const url = process.env[env];

  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const doc = await res.json();
      if (!isValid(doc)) {
        throw new Error("no items in payload");
      }
      console.log(`${name}: ${doc.items.length} from ${url}`);
      return doc.items;
    } catch (err) {
      console.warn(`${name}: remote failed (${err.message}), using ${snapshot}`);
    }
  }

  const doc = JSON.parse(await readFile(join(root, snapshot), "utf8"));
  if (!isValid(doc)) {
    throw new Error(`${snapshot} has no items - cannot build`);
  }
  console.log(`${name}: ${doc.items.length} from ${snapshot}`);
  return doc.items;
}

const escape = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Accept both the web snapshot shape (hook/tags/date) and the live S3 posts
// shape (description/tag_list/published_at) until every producer emits one schema.
function itemDate(i) {
  const raw = i.date || i.published_at || "";
  return String(raw).slice(0, 10);
}

function itemHook(i) {
  return i.hook || i.description || "";
}

function itemTags(i) {
  if (Array.isArray(i.tags) && i.tags.length) {
    return i.tags;
  }
  if (Array.isArray(i.tag_list) && i.tag_list.length) {
    return i.tag_list;
  }
  return [];
}

// Most recent first, with `featured` entries pinned to the front.
function pick(items, count, filter = () => true) {
  return items
    .filter(filter)
    .sort((a, b) => {
      if (Boolean(b.featured) !== Boolean(a.featured)) {
        return Boolean(b.featured) - Boolean(a.featured);
      }
      return itemDate(b).localeCompare(itemDate(a));
    })
    .slice(0, count);
}

function card({ url, kicker, title, hook, tag }) {
  return [
    `          <a class="card" href="${escape(url)}" rel="noopener noreferrer">`,
    `            <p class="card-kicker">${escape(kicker)}</p>`,
    `            <h3 class="card-title">${escape(title)}</h3>`,
    `            <p class="card-body">${escape(hook)}</p>`,
    tag ? `            <span class="card-tag">${escape(tag)}</span>` : null,
    `          </a>`
  ]
    .filter(Boolean)
    .join("\n");
}

function replace(html, name, block) {
  const start = `<!-- build:${name}:start -->`;
  const end = `<!-- build:${name}:end -->`;
  const pattern = new RegExp(`([ \\t]*)${start}[\\s\\S]*?${end}`);
  if (!pattern.test(html)) {
    throw new Error(`marker build:${name} not found in index.html`);
  }
  return html.replace(pattern, (_m, indent) => `${indent}${start}\n${block}\n${indent}${end}`);
}

function replaceIn(html, name, block, fileLabel) {
  const start = `<!-- build:${name}:start -->`;
  const end = `<!-- build:${name}:end -->`;
  const pattern = new RegExp(`([ \\t]*)${start}[\\s\\S]*?${end}`);
  if (!pattern.test(html)) {
    throw new Error(`marker build:${name} not found in ${fileLabel}`);
  }
  return html.replace(pattern, (_m, indent) => {
    if (!block) {
      return `${indent}${start}\n${indent}${end}`;
    }
    const indented = block
      .split("\n")
      .map((line) => (line ? `${indent}${line}` : line))
      .join("\n");
    return `${indent}${start}\n${indented}\n${indent}${end}`;
  });
}

// GA4 page views when GA_MEASUREMENT_ID is set (Amplify production branch).
function analyticsBlock() {
  const id = (process.env.GA_MEASUREMENT_ID || "").trim();
  if (!id) {
    return "";
  }
  if (!/^G-[A-Z0-9]+$/i.test(id)) {
    throw new Error(`GA_MEASUREMENT_ID looks invalid: ${id}`);
  }
  const safe = escape(id);
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${safe}"></script>`,
    `<script>`,
    `  window.dataLayer = window.dataLayer || [];`,
    `  function gtag() {`,
    `    dataLayer.push(arguments);`,
    `  }`,
    `  gtag("js", new Date());`,
    `  gtag("config", "${safe}");`,
    `</script>`
  ].join("\n");
}

const [labs, posts] = await Promise.all([load("labs"), load("posts")]);

const labBlock = pick(labs, LAB_COUNT, (i) => i.type === "walkthrough" && i.url)
  .map((i) => {
    const tags = itemTags(i);
    return card({
      url: i.url,
      kicker: i.category || "walkthrough",
      title: i.title,
      hook: itemHook(i),
      tag: tags[0]
    });
  })
  .join("\n\n");

const postBlock = pick(posts, POST_COUNT)
  .map((i) => {
    const tags = itemTags(i);
    return card({
      url: i.url,
      kicker: tags[0] || "dev.to",
      title: i.title,
      hook: itemHook(i),
      tag: tags[1] || tags[0]
    });
  })
  .join("\n\n");

const gaBlock = analyticsBlock();
if (gaBlock) {
  console.log(`analytics: GA4 ${process.env.GA_MEASUREMENT_ID.trim()}`);
} else {
  console.log("analytics: skipped (GA_MEASUREMENT_ID unset)");
}

const indexPath = join(root, "index.html");
let indexHtml = await readFile(indexPath, "utf8");
indexHtml = replace(indexHtml, "labs", labBlock);
indexHtml = replace(indexHtml, "writing", postBlock);
indexHtml = replaceIn(indexHtml, "analytics", gaBlock, "index.html");
await writeFile(indexPath, indexHtml);

const notFoundPath = join(root, "404.html");
let notFoundHtml = await readFile(notFoundPath, "utf8");
notFoundHtml = replaceIn(notFoundHtml, "analytics", gaBlock, "404.html");
await writeFile(notFoundPath, notFoundHtml);

console.log("index.html and 404.html updated");
