import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import EmptyState from '../components/EmptyState';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const CATEGORY_LABELS = {
  pageSpeed: 'Page Speed',
  meta: 'Meta & Indexing',
  headings: 'Heading Structure',
  content: 'Content',
  images: 'Images',
  social: 'Social / Sharing',
  structuredData: 'Structured Data',
  technical: 'Technical Basics',
  links: 'Links',
  duplicateContent: 'Duplicate Content',
};

const CATEGORY_ORDER = [
  'pageSpeed',
  'meta',
  'headings',
  'content',
  'images',
  'social',
  'structuredData',
  'technical',
  'links',
  'duplicateContent',
];

function cwvTone(rating) {
  if (rating === 'good') return 'bg-healthy-soft text-healthy border-healthy/30';
  if (rating === 'needs-improvement') return 'bg-checking-soft text-checking border-checking/30';
  if (rating === 'poor') return 'bg-down-soft text-down border-down/30';
  return 'bg-canvas text-muted border-border';
}

function formatCwvLabel(rating) {
  if (!rating) return 'n/a';
  return rating.replace(/-/g, ' ');
}

function TestStatusTag({ status }) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
        No result
      </span>
    );
  }
  const styles = {
    pass: 'bg-healthy-soft text-healthy',
    warn: 'bg-checking-soft text-checking',
    fail: 'bg-down-soft text-down',
  };
  const labels = { pass: 'Pass', warn: 'Warn', fail: 'Fail' };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.warn
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function gradeTone(grade) {
  if (grade === 'A') return 'text-healthy bg-healthy-soft border-healthy/30';
  if (grade === 'B') return 'text-info bg-info-soft border-info/30';
  if (grade === 'C') return 'text-checking bg-checking-soft border-checking/30';
  if (grade === 'D') return 'text-checking bg-checking-soft border-checking/30';
  return 'text-down bg-down-soft border-down/30';
}

function scoreBarColor(score) {
  if (score == null) return 'bg-muted';
  if (score >= 85) return 'bg-healthy';
  if (score >= 60) return 'bg-checking';
  return 'bg-down';
}

function FindingList({ findings = [] }) {
  if (!findings.length) return <p className="text-sm text-muted">No findings.</p>;
  const tone = {
    pass: 'text-healthy',
    warn: 'text-checking',
    fail: 'text-down',
    info: 'text-muted',
  };
  return (
    <ul className="space-y-1.5">
      {findings.map((f, i) => (
        <li key={`${f.message}-${i}`} className={`text-sm ${tone[f.severity] || 'text-ink'}`}>
          <span className="font-semibold uppercase text-[10px] tracking-wide mr-1.5">
            {f.severity}
          </span>
          {f.message}
        </li>
      ))}
    </ul>
  );
}

/** Map audit findings → plain-language problem + how to fix. */
const FIX_RULES = [
  {
    match: /missing <title>|missing title/i,
    problem: 'The page has no title tag',
    fix: 'Add a unique <title> of about 30–60 characters that describes the page for search results.',
  },
  {
    match: /title is short/i,
    problem: 'The page title is too short',
    fix: 'Expand the title to roughly 30–60 characters with the main keyword and brand.',
  },
  {
    match: /title is long/i,
    problem: 'The page title is too long',
    fix: 'Shorten the title to about 30–60 characters so it doesn’t get cut off in Google.',
  },
  {
    match: /missing meta description/i,
    problem: 'No meta description',
    fix: 'Add a <meta name="description"> (about 70–160 characters) that summarizes the page and encourages clicks.',
  },
  {
    match: /meta description is short/i,
    problem: 'Meta description is too short',
    fix: 'Write a clearer description around 70–160 characters with a benefit and call to action.',
  },
  {
    match: /meta description is long/i,
    problem: 'Meta description is too long',
    fix: 'Trim the description to ~160 characters so search engines don’t truncate it awkwardly.',
  },
  {
    match: /noindex/i,
    problem: 'Page is blocked from search (noindex)',
    fix: 'Remove noindex from the robots meta (or X-Robots-Tag) if this page should appear in Google.',
  },
  {
    match: /html lang/i,
    problem: 'Missing language attribute',
    fix: 'Set <html lang="en"> (or your language code) so browsers and search engines know the page language.',
  },
  {
    match: /no h1|missing h1/i,
    problem: 'No H1 heading',
    fix: 'Add one clear H1 that states the main topic of the page.',
  },
  {
    match: /multiple h1/i,
    problem: 'Too many H1 headings',
    fix: 'Keep a single H1 for the main topic; demote extra H1s to H2/H3.',
  },
  {
    match: /skip|heading levels|without h2/i,
    problem: 'Heading structure is messy',
    fix: 'Use headings in order (H1 → H2 → H3). Don’t skip levels.',
  },
  {
    match: /thin content|visible words/i,
    problem: 'Content is too thin',
    fix: 'Add useful, unique content (aim for 150+ meaningful words) that answers what visitors search for.',
  },
  {
    match: /text-to-html ratio/i,
    problem: 'Page is heavy on code vs text',
    fix: 'Reduce unused markup/scripts or add more readable content so the page isn’t mostly code.',
  },
  {
    match: /missing alt/i,
    problem: 'Images missing alt text',
    fix: 'Add descriptive alt="" on images (especially important ones) for accessibility and image search.',
  },
  {
    match: /width\/height|dimensions/i,
    problem: 'Images missing width/height',
    fix: 'Set width and height (or aspect-ratio) on images to reduce layout shift (CLS).',
  },
  {
    match: /og:title|og:description|og:image|open graph/i,
    problem: 'Weak social sharing tags',
    fix: 'Add Open Graph tags (og:title, og:description, og:image) so links look good on social and chat apps.',
  },
  {
    match: /twitter:/i,
    problem: 'Missing Twitter card tags',
    fix: 'Add twitter:card and twitter:title/description/image for better previews on X/Twitter.',
  },
  {
    match: /viewport/i,
    problem: 'Not mobile-friendly (no viewport)',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
  },
  {
    match: /favicon/i,
    problem: 'No favicon',
    fix: 'Add a favicon link (e.g. /favicon.ico or apple-touch-icon) so the site looks trusted in tabs and bookmarks.',
  },
  {
    match: /robots\.txt/i,
    problem: 'robots.txt missing or unreachable',
    fix: 'Publish a robots.txt at the site root. Allow important pages; don’t block CSS/JS Google needs.',
  },
  {
    match: /sitemap\.xml/i,
    problem: 'No sitemap.xml found',
    fix: 'Create and submit a sitemap.xml listing your important URLs, then reference it in robots.txt.',
  },
  {
    match: /structured data|json-ld|schema|@type|parse error/i,
    problem: 'Structured data issues',
    fix: 'Add valid JSON-LD (Organization, WebSite, Article, Product, etc.) and fix any parse errors with Google’s Rich Results Test.',
  },
  {
    match: /duplicate title/i,
    problem: 'Duplicate page titles across sites',
    fix: 'Give each page a unique title so search engines can tell them apart.',
  },
  {
    match: /duplicate description/i,
    problem: 'Duplicate meta descriptions',
    fix: 'Write a unique meta description per page instead of copying the same one everywhere.',
  },
  {
    match: /lcp|largest contentful paint/i,
    problem: 'Slow Largest Contentful Paint (LCP)',
    fix: 'Optimize the main image/hero, compress media, use a CDN, and reduce render-blocking scripts.',
  },
  {
    match: /cls|layout shift/i,
    problem: 'Layout shifts (CLS)',
    fix: 'Reserve space for images/ads/fonts (width/height or aspect-ratio) so content doesn’t jump while loading.',
  },
  {
    match: /inp|interaction to next paint/i,
    problem: 'Slow interactions (INP)',
    fix: 'Break up long JavaScript tasks, defer non-critical scripts, and keep the main thread free for clicks.',
  },
  {
    match: /page ?speed|core web vital|performance/i,
    problem: 'Page speed needs improvement',
    fix: 'Compress images, cache assets, minify CSS/JS, and remove unused third-party scripts.',
  },
  {
    match: /broken|404|dead link/i,
    problem: 'Broken links on the page',
    fix: 'Fix or remove links that return errors so users and crawlers aren’t sent to dead pages.',
  },
  {
    match: /canonical/i,
    problem: 'Canonical URL not set clearly',
    fix: 'Add <link rel="canonical" href="..."> pointing to the preferred URL for this content.',
  },
  {
    match: /stale|freshness|outdated/i,
    problem: 'Content may look outdated',
    fix: 'Update key pages regularly and expose a clear last-updated or article:modified_time date when relevant.',
  },
];

function resolveFix(finding, categoryKey) {
  const msg = finding?.message || '';
  for (const rule of FIX_RULES) {
    if (rule.match.test(msg)) {
      return { problem: rule.problem, fix: rule.fix };
    }
  }
  const category = CATEGORY_LABELS[categoryKey] || categoryKey || 'SEO';
  return {
    problem: msg || `Issue in ${category}`,
    fix: `Review the ${category} section below, then update the page and run SEO test again to confirm.`,
  };
}

function collectProblems(categories = {}) {
  const items = [];
  for (const [key, cat] of Object.entries(categories)) {
    if (!cat || key === 'freshness') continue;
    for (const f of cat.findings || []) {
      if (f.severity !== 'fail' && f.severity !== 'warn') continue;
      const resolved = resolveFix(f, key);
      items.push({
        id: `${key}-${f.severity}-${f.message}`,
        severity: f.severity,
        categoryKey: key,
        category: CATEGORY_LABELS[key] || key,
        raw: f.message,
        problem: resolved.problem,
        fix: resolved.fix,
        score: cat.score,
      });
    }
    // Low category score with no findings still deserves a tip
    if (
      (!cat.findings || cat.findings.length === 0) &&
      cat.score != null &&
      cat.score < 70 &&
      !cat.unknown
    ) {
      items.push({
        id: `${key}-low-score`,
        severity: cat.score < 50 ? 'fail' : 'warn',
        categoryKey: key,
        category: CATEGORY_LABELS[key] || key,
        raw: `${CATEGORY_LABELS[key] || key} scored ${cat.score}/100`,
        problem: `${CATEGORY_LABELS[key] || key} score is low (${cat.score}/100)`,
        fix: `Open the ${CATEGORY_LABELS[key] || key} category, improve the weakest items, then re-run the SEO test.`,
        score: cat.score,
      });
    }
  }

  const severityRank = { fail: 0, warn: 1 };
  items.sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    return (a.score ?? 100) - (b.score ?? 100);
  });

  // Deduplicate similar problems
  const seen = new Set();
  return items.filter((item) => {
    const k = item.problem.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function SeoProblemsPanel({ categories, overallScore, onJumpCategory, className = '' }) {
  const problems = collectProblems(categories);
  const fails = problems.filter((p) => p.severity === 'fail').length;
  const warns = problems.filter((p) => p.severity === 'warn').length;

  if (problems.length === 0) {
    return (
      <section
        className={`flex h-full flex-col justify-center rounded-2xl border border-healthy/30 bg-healthy-soft/40 p-5 sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-healthy text-white text-lg">
            ✓
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Looking good</h2>
            <p className="mt-1 text-sm text-muted">
              No major SEO problems were flagged
              {overallScore != null ? ` (score ${overallScore}/100)` : ''}. Keep content fresh and
              re-test after big site changes.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
    >
      <div className="shrink-0 border-b border-border bg-gradient-to-r from-down-soft/50 via-checking-soft/30 to-surface px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink sm:text-lg">What’s wrong & how to fix it</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              Issues ranked by severity, with steps to improve.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fails > 0 ? (
              <span className="rounded-full bg-down-soft px-2.5 py-1 text-xs font-bold text-down">
                {fails} critical
              </span>
            ) : null}
            {warns > 0 ? (
              <span className="rounded-full bg-checking-soft px-2.5 py-1 text-xs font-bold text-checking">
                {warns} improve
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <ol className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {problems.map((item, index) => (
          <li key={item.id} className="px-4 py-3.5 sm:px-5 hover:bg-canvas/40 transition-colors">
            <div className="flex gap-3">
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  item.severity === 'fail' ? 'bg-down text-white' : 'bg-checking text-white'
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      item.severity === 'fail'
                        ? 'bg-down-soft text-down'
                        : 'bg-checking-soft text-checking'
                    }`}
                  >
                    {item.severity === 'fail' ? 'Critical' : 'Needs improvement'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpCategory?.(item.categoryKey)}
                    className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted hover:text-brand"
                  >
                    {item.category}
                  </button>
                </div>
                <p className="text-sm font-semibold text-ink">{item.problem}</p>
                <p className="text-xs text-muted leading-relaxed">
                  <span className="font-semibold text-ink/70">Detected: </span>
                  {item.raw}
                </p>
                <div className="rounded-xl border border-brand/20 bg-brand-soft/40 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand">
                    How to make it better
                  </p>
                  <p className="mt-1 text-sm text-ink leading-relaxed">{item.fix}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PageSpeedDetails({ cat }) {
  const metrics = [
    {
      key: 'lcp',
      label: 'LCP',
      hint: 'Largest Contentful Paint',
      display:
        cat?.lcp?.valueMs != null ? `${(cat.lcp.valueMs / 1000).toFixed(2)}s` : '—',
      rating: cat?.lcp?.rating,
    },
    {
      key: 'cls',
      label: 'CLS',
      hint: 'Cumulative Layout Shift',
      display: cat?.cls?.value != null ? String(cat.cls.value) : '—',
      rating: cat?.cls?.rating,
    },
    {
      key: 'inp',
      label: 'INP',
      hint: 'Interaction to Next Paint',
      display: cat?.inp?.valueMs != null ? `${cat.inp.valueMs}ms` : '—',
      rating: cat?.inp?.rating,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.key}
            className={`rounded-xl border px-3 py-2.5 ${cwvTone(m.rating)}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{m.label}</p>
            <p className="text-lg font-bold tabular-nums">{m.display}</p>
            <p className="text-[11px] capitalize">{formatCwvLabel(m.rating)}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{m.hint}</p>
          </div>
        ))}
      </div>
      <FindingList findings={cat?.findings || []} />
    </div>
  );
}

function StructuredDataDetails({ cat }) {
  const types = cat?.types || [];
  return (
    <div className="space-y-3">
      {types.length ? (
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand"
            >
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">None found — no JSON-LD @type detected.</p>
      )}
      {(cat?.parseErrors || []).length > 0 ? (
        <p className="text-sm text-down">
          Parse errors: {cat.parseErrors.slice(0, 3).join('; ')}
        </p>
      ) : null}
      <FindingList findings={cat?.findings || []} />
    </div>
  );
}

function DuplicateContentDetails({ cat }) {
  const titles = cat?.duplicateTitleWith || [];
  const descs = cat?.duplicateDescriptionWith || [];
  return (
    <div className="space-y-3">
      <FindingList findings={cat?.findings || []} />
      {titles.length ? (
        <div>
          <p className="text-xs font-semibold text-ink mb-1">Duplicate title with</p>
          <ul className="space-y-1">
            {titles.map((url) => (
              <li key={`t-${url}`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {descs.length ? (
        <div>
          <p className="text-xs font-semibold text-ink mb-1">Duplicate meta description with</p>
          <ul className="space-y-1">
            {descs.map((url) => (
              <li key={`d-${url}`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CategoryDetails({ categoryKey, cat }) {
  if (categoryKey === 'pageSpeed') return <PageSpeedDetails cat={cat} />;
  if (categoryKey === 'structuredData') return <StructuredDataDetails cat={cat} />;
  if (categoryKey === 'duplicateContent') return <DuplicateContentDetails cat={cat} />;
  return <FindingList findings={cat?.findings || []} />;
}

function SiteLogoMark({ logoUrl, siteUrl, grade }) {
  const fallbackFavicon = (() => {
    try {
      if (!siteUrl) return null;
      const host = new URL(siteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
    } catch {
      return null;
    }
  })();

  const [src, setSrc] = useState(logoUrl || fallbackFavicon || null);

  useEffect(() => {
    setSrc(logoUrl || fallbackFavicon || null);
  }, [logoUrl, fallbackFavicon]);

  const gradeText =
    gradeTone(grade)
      .split(' ')
      .find((c) => c.startsWith('text-')) || 'text-ink';

  return (
    <div className="relative h-20 w-20 shrink-0">
      <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {src ? (
          <img
            src={src}
            alt="Website logo"
            className="h-12 w-12 object-contain"
            onError={() => {
              if (fallbackFavicon && src !== fallbackFavicon) setSrc(fallbackFavicon);
              else setSrc(null);
            }}
          />
        ) : (
          <span className={`text-3xl font-bold ${gradeText}`}>{grade || '—'}</span>
        )}
      </div>
      {grade ? (
        <span
          className={`absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border text-xs font-bold shadow-sm ${gradeTone(
            grade
          )}`}
        >
          {grade}
        </span>
      ) : null}
    </div>
  );
}

function SeoAuditReport({ test, websiteUrl }) {
  const [openCat, setOpenCat] = useState(null);
  const details = test?.details;

  if (!test?.status) {
    return (
      <EmptyState
        title="No SEO results yet"
        description="Run an SEO test to generate a scored audit with category breakdowns."
      />
    );
  }

  if (!details?.categories) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
        {test.summary || 'SEO result available, but this scan used an older format. Run a new test.'}
      </div>
    );
  }

  const { overallScore, grade, categories = {}, siteLogo, siteUrl } = details;
  const logoSiteUrl = siteUrl || websiteUrl || null;
  const freshness = categories.freshness;
  const entries = CATEGORY_ORDER.filter(
    (key) => key !== 'freshness' && categories[key]
  ).map((key) => [key, categories[key]]);
  for (const [key, cat] of Object.entries(categories)) {
    if (key === 'freshness') continue;
    if (!CATEGORY_ORDER.includes(key)) entries.push([key, cat]);
  }

  const jumpToCategory = (key) => {
    setOpenCat(key);
    window.requestAnimationFrame(() => {
      document.getElementById(`seo-cat-${key}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-5">
        <SiteLogoMark logoUrl={siteLogo} siteUrl={logoSiteUrl} grade={grade} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">Overall SEO score</p>
          <p className="text-4xl font-bold text-ink tabular-nums">
            {overallScore != null ? overallScore : '—'}
            <span className="text-lg font-medium text-muted">/100</span>
          </p>
          <p className="mt-1 text-sm text-muted">{test.summary}</p>
          <p className="mt-1 text-xs text-muted">
            Last run {formatWhen(test.created_at)}
            {test.scan_id ? ` · scan #${test.scan_id}` : ''}
          </p>
          {freshness ? (
            <p className="mt-2 text-xs text-muted">
              <span className="font-semibold text-ink">Freshness: </span>
              {freshness.stale
                ? `Stale signal (${freshness.date || 'unknown date'})`
                : freshness.date
                  ? `Updated ${freshness.date}`
                  : 'No date signal (informational — not scored)'}
            </p>
          ) : null}
        </div>
        <TestStatusTag status={test.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-5">
        <SeoProblemsPanel
          className="lg:max-h-[min(70vh,640px)]"
          categories={categories}
          overallScore={overallScore}
          onJumpCategory={jumpToCategory}
        />

        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface lg:max-h-[min(70vh,640px)]">
          <div className="shrink-0 border-b border-border px-4 py-3.5 sm:px-5">
            <h2 className="text-base font-bold text-ink sm:text-lg">Categories</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              Scores by area — open any row for details.
            </p>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
            {entries.map(([key, cat]) => {
              const isOpen = openCat === key;
              const score = cat?.score;
              const cacheLabel =
                cat?.cached && key === 'pageSpeed'
                  ? 'cached ~8h'
                  : cat?.cached
                    ? 'cached 24h'
                    : null;
              return (
                <div
                  key={key}
                  id={`seo-cat-${key}`}
                  className="rounded-xl border border-border bg-canvas/30 overflow-hidden scroll-mt-4"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCat(isOpen ? null : key)}
                    className="w-full px-3.5 py-3 flex items-center gap-3 text-left hover:bg-canvas/70"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {CATEGORY_LABELS[key] || key}
                        </span>
                        <TestStatusTag status={cat?.status} />
                        {cacheLabel ? (
                          <span className="text-[10px] font-medium text-muted">{cacheLabel}</span>
                        ) : null}
                        {cat?.unknown ? (
                          <span className="text-[10px] font-medium text-muted">excluded</span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 h-1.5 w-full max-w-sm rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBarColor(score)}`}
                          style={{ width: `${score != null ? Math.min(100, score) : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-ink shrink-0">
                      {score != null ? score : '—'}
                    </span>
                    <span className="text-xs text-muted shrink-0">{isOpen ? 'Hide' : 'Show'}</span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-border bg-surface px-3.5 py-3">
                      <CategoryDetails categoryKey={key} cat={cat} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeoTesting() {
  const [websites, setWebsites] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [seoTest, setSeoTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const loadWebsites = useCallback(async () => {
    const w = await api('/api/websites');
    const list = w.websites || [];
    setWebsites(list);
    setSelectedId((prev) => prev || (list[0] ? String(list[0].id) : ''));
    return list;
  }, []);

  const loadSeo = useCallback(async (siteId) => {
    if (!siteId) {
      setSeoTest(null);
      return;
    }
    const data = await api(`/api/websites/${siteId}/tests`);
    const seo = (data.tests || []).find((t) => t.test_type === 'seo_basics') || null;
    setSeoTest(seo?.status ? seo : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await loadWebsites();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadWebsites]);

  useEffect(() => {
    if (!selectedId) {
      setSeoTest(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await loadSeo(selectedId);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, loadSeo]);

  const runSeoTest = async () => {
    if (!selectedId) return;
    setRunning(true);
    setError('');
    try {
      await api(`/api/websites/${selectedId}/scan`, { method: 'POST' });
      await loadSeo(selectedId);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">SEO Testing</h1>
        <p className="mt-1 text-sm text-muted">
          Scored SEO audit plus a clear list of what’s wrong on the site and how to improve it.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      <div className="rounded-2xl border border-border bg-surface p-5 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-ink">Website</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={websites.length === 0}
            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
          >
            {websites.length === 0 ? (
              <option value="">No websites yet</option>
            ) : (
              websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.url}
                </option>
              ))
            )}
          </select>
        </label>
        <button
          type="button"
          disabled={!selectedId || running}
          onClick={runSeoTest}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {running ? 'Running SEO test…' : 'Run SEO test'}
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading SEO results…</p>
      ) : websites.length === 0 ? (
        <EmptyState
          title="Add a website first"
          description="SEO testing runs against sites you monitor."
          action={
            <Link
              to="/app/websites"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Go to Websites
            </Link>
          }
        />
      ) : (
        <SeoAuditReport
          test={seoTest}
          websiteUrl={websites.find((w) => String(w.id) === String(selectedId))?.url}
        />
      )}
    </div>
  );
}
