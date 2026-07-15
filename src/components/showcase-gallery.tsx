"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "../data/products";
import repositoryDates from "../data/repository-dates.json";

const tones = ["coral", "teal", "blue", "amber", "violet", "green"];
type HealthInfo = { status: "checking" | "online" | "offline" | "unknown"; createdAt?: string; updatedAt?: string };
type HealthFilter = "all" | "online" | "issues" | "checking";
const repositoryDateMap = repositoryDates as Record<string, { created_at: string; pushed_at: string }>;

function getRepositoryDates(product: Product) {
  return repositoryDateMap[product.githubUrl.replace(/\/$/, "").toLowerCase()];
}
const categoryStyles: Record<string, { tone: string; mark: string }> = {
  "製造與工程": { tone: "teal", mark: "製" },
  "協作與管理": { tone: "green", mark: "協" },
  "ESG 與永續": { tone: "amber", mark: "綠" },
  "金融與保險": { tone: "violet", mark: "財" },
  "企業營運": { tone: "coral", mark: "營" },
  "教育與照護": { tone: "blue", mark: "學" },
  "交通與車輛": { tone: "blue", mark: "行" },
  "零售與服務": { tone: "coral", mark: "店" },
};

export function ShowcaseGallery({
  products,
  categories,
  initialCategory = "全部",
}: {
  products: Product[];
  categories: string[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recommended");
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [health, setHealth] = useState<Record<string, HealthInfo>>(() => Object.fromEntries(
    products.map((product) => {
      const dates = getRepositoryDates(product);
      return [product.slug, { status: "checking", createdAt: dates?.created_at, updatedAt: dates?.pushed_at }];
    }),
  ));
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [posterProduct, setPosterProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!posterProduct) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosterProduct(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [posterProduct]);

  const matchedProducts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-TW");
    return products.filter((product) => {
      const categoryMatch = category === "全部" || product.category === category;
      const text = `${product.name} ${product.module} ${product.description}`.toLocaleLowerCase("zh-TW");
      return categoryMatch && (!needle || text.includes(needle));
    });
  }, [category, products, query]);

  const healthCounts = useMemo(() => matchedProducts.reduce((counts, product) => {
    const status = health[product.slug]?.status ?? "checking";
    counts.all += 1;
    counts[status] += 1;
    if (status === "offline" || status === "unknown") counts.issues += 1;
    return counts;
  }, { all: 0, online: 0, offline: 0, unknown: 0, issues: 0, checking: 0 }), [health, matchedProducts]);

  const filtered = useMemo(() => matchedProducts.filter((product) => {
    const status = health[product.slug]?.status ?? "checking";
    if (healthFilter === "issues") return status === "offline" || status === "unknown";
    if (healthFilter === "all") return true;
    return status === healthFilter;
  }), [health, healthFilter, matchedProducts]);

  const sortedProducts = useMemo(() => {
    if (sort === "newest") return [...filtered].sort((left, right) => {
      const leftDate = getRepositoryDates(left)?.created_at;
      const rightDate = getRepositoryDates(right)?.created_at;
      return (rightDate ? Date.parse(rightDate) : right.id) - (leftDate ? Date.parse(leftDate) : left.id);
    });
    if (sort === "updated") return [...filtered].sort((left, right) => {
      const leftDate = getRepositoryDates(left)?.pushed_at;
      const rightDate = getRepositoryDates(right)?.pushed_at;
      return (rightDate ? Date.parse(rightDate) : right.id) - (leftDate ? Date.parse(leftDate) : left.id);
    });
    if (sort === "name") return [...filtered].sort((left, right) => left.name.localeCompare(right.name, "zh-TW"));
    if (sort === "category") return [...filtered].sort((left, right) => left.category.localeCompare(right.category, "zh-TW") || left.name.localeCompare(right.name, "zh-TW"));
    return filtered;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const visibleProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);
  const productSlugKey = useMemo(() => products.map((product) => product.slug).join(","), [products]);

  useEffect(() => {
    if (!productSlugKey) return;
    const controller = new AbortController();
    const slugs = productSlugKey.split(",");
    setHealth((current) => ({
      ...current,
      ...Object.fromEntries(slugs.map((slug) => [slug, { ...current[slug], status: "checking" as const }])),
    }));
    fetch("/api/demo-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("health check failed")))
      .then((data: { results: Record<string, HealthInfo> }) => {
        setHealth((current) => ({ ...current, ...data.results }));
        setLastCheckedAt(new Date());
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setHealth((current) => ({
            ...current,
            ...Object.fromEntries(slugs.map((slug) => [slug, { ...current[slug], status: "unknown" as const }])),
          }));
        }
      });
    return () => controller.abort();
  }, [productSlugKey]);

  function formatDate(value?: string) {
    if (!value) return "";
    return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  }

  function isRecent(value?: string) {
    return Boolean(value) && Date.now() - new Date(value as string).getTime() < 45 * 24 * 60 * 60 * 1000;
  }

  function selectHealthFilter(nextFilter: HealthFilter) {
    setHealthFilter(nextFilter);
    setPage(1);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    document.querySelector(".result-row")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="explore" id="gallery">
        <div className="explore-heading">
          <div>
            <p className="eyebrow">探索 Demo</p>
            <h2>找到適合你的數位工作方式</h2>
          </div>
          <p>從產業、部門或工作情境開始搜尋，每一張卡片都能直接進入可操作的正式 Demo。</p>
        </div>

        <div className="filter-panel">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="搜尋系統、功能或產業，例如：人資、庫存、照護"
              aria-label="搜尋 Demo"
            />
          </label>
          <div className="category-list" aria-label="Demo 分類">
            {["全部", ...categories].map((item) => (
              <button
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => {
                  setCategory(item);
                  setPage(1);
                }}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="health-overview" aria-labelledby="health-overview-title">
          <div className="health-overview-heading">
            <div>
              <span>網址監測</span>
              <strong id="health-overview-title">Demo 健康檢查總覽</strong>
            </div>
            <small aria-live="polite">{lastCheckedAt ? `最後檢查 ${lastCheckedAt.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}` : "正在檢查全部網址"}</small>
          </div>
          <div className="health-summary-grid">
            <button type="button" className={`health-summary-card summary-all ${healthFilter === "all" ? "active" : ""}`} onClick={() => selectHealthFilter("all")} aria-pressed={healthFilter === "all"}>
              <span>全部 Demo</span><strong>{healthCounts.all}</strong><small>目前搜尋與分類</small>
            </button>
            <button type="button" className={`health-summary-card summary-online ${healthFilter === "online" ? "active" : ""}`} onClick={() => selectHealthFilter("online")} aria-pressed={healthFilter === "online"}>
              <span>正常上線</span><strong>{healthCounts.online}</strong><small>網址可正常開啟</small>
            </button>
            <button type="button" className={`health-summary-card summary-issues ${healthFilter === "issues" ? "active" : ""}`} onClick={() => selectHealthFilter("issues")} aria-pressed={healthFilter === "issues"}>
              <span>異常 Demo</span><strong>{healthCounts.issues}</strong><small>離線 {healthCounts.offline} · 待確認 {healthCounts.unknown}</small>
            </button>
            <button type="button" className={`health-summary-card summary-checking ${healthFilter === "checking" ? "active" : ""}`} onClick={() => selectHealthFilter("checking")} aria-pressed={healthFilter === "checking"}>
              <span>檢查中</span><strong>{healthCounts.checking}</strong><small>等待網址回應</small>
            </button>
          </div>
        </section>

        <div className="result-row">
          <div><strong>{filtered.length} 個 Demo</strong><span>第 {page} / {totalPages} 頁 · {healthFilter === "issues" ? "只顯示異常與待確認" : healthFilter === "online" ? "只顯示正常上線" : healthFilter === "checking" ? "只顯示檢查中" : category === "全部" ? "顯示所有分類" : `目前分類：${category}`}</span></div>
          <div className="result-controls">
            <div className="view-switch" aria-label="顯示方式">
              <button type="button" className={viewMode === "cards" ? "active" : ""} onClick={() => setViewMode("cards")} aria-pressed={viewMode === "cards"}>卡片</button>
              <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}>列表</button>
            </div>
            <label>排序
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                <option value="recommended">推薦排序</option>
                <option value="newest">最近新增</option>
                <option value="updated">最近更新</option>
                <option value="name">名稱 A–Z</option>
                <option value="category">依分類</option>
              </select>
            </label>
            <label>每頁
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                <option value={12}>12 個</option>
                <option value={24}>24 個</option>
                <option value={60}>全部</option>
              </select>
            </label>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className={`gallery-grid ${viewMode === "list" ? "list-view" : ""}`}>
              {visibleProducts.map((product) => {
                const info = health[product.slug];
                const status = info?.status || "checking";
                return (
                <article className="demo-card" data-slug={product.slug} key={product.slug}>
                  <div className="card-main">
                    <div className={`card-visual tone-${categoryStyles[product.category]?.tone || tones[(product.id - 1) % tones.length]}`}>
                      <span>{product.category}</span>
                      <b>{String(product.id).padStart(2, "0")}</b>
                      <strong>{product.name}</strong>
                      <i aria-hidden="true">{categoryStyles[product.category]?.mark || "JV"}</i>
                    </div>
                    <div className="card-copy">
                      <div className="card-meta">
                        <span>{product.category}{isRecent(info?.createdAt) ? <b className="recent-badge">最近新增</b> : null}</span>
                        <span className={`health-status status-${status}`}>{status === "online" ? "正常上線" : status === "offline" ? "暫時無法連線" : status === "unknown" ? "暫時無法確認" : "檢查中"}</span>
                      </div>
                      <h3>{product.name}</h3>
                      <p>{product.description.replace(/ Demo$/i, "")}</p>
                      <small>{product.module}</small>
                      {info?.updatedAt ? <time dateTime={info.updatedAt}>{info.createdAt ? `新增於 ${formatDate(info.createdAt)} · ` : ""}更新於 {formatDate(info.updatedAt)}</time> : null}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="poster-button" onClick={() => setPosterProduct(product)}>
                      查看海報
                    </button>
                    <a className="github-button" href={product.githubUrl}>
                      GitHub <span aria-hidden="true">↗</span>
                    </a>
                    <a className="open-demo" href={product.demoUrl}>
                      進入 Demo <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              );})}
            </div>
            {totalPages > 1 ? (
              <nav className="pagination" aria-label="Demo 分頁">
                <button type="button" className="page-direction" disabled={page === 1} onClick={() => goToPage(page - 1)}>← 上一頁</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    type="button"
                    className={page === pageNumber ? "active" : ""}
                    aria-current={page === pageNumber ? "page" : undefined}
                    onClick={() => goToPage(pageNumber)}
                    key={pageNumber}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button type="button" className="page-direction" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>下一頁 →</button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <strong>{healthFilter === "issues" ? "目前沒有異常 Demo" : healthFilter === "checking" ? "所有網址都已完成檢查" : "目前找不到符合的 Demo"}</strong>
            <p>{healthFilter === "issues" ? "目前範圍內的 Demo 網址皆可正常開啟。" : "請調整搜尋關鍵字、健康狀態或切換其他分類。"}</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("全部"); setHealthFilter("all"); setPage(1); }}>清除篩選</button>
          </div>
        )}
      </section>

      {posterProduct ? (
        <div
          className="poster-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPosterProduct(null);
          }}
        >
          <section className="poster-dialog" role="dialog" aria-modal="true" aria-label={`${posterProduct.name} 產品海報`}>
            <div className="poster-dialog-header">
              <div><span>產品海報</span><strong>{posterProduct.name}</strong></div>
              <button type="button" onClick={() => setPosterProduct(null)} aria-label="關閉海報">×</button>
            </div>
            <div className="poster-dialog-body">
              <img src={posterProduct.posterUrl || `/posters/${posterProduct.slug}.png`} alt={`${posterProduct.name} 產品海報`} width="1240" height="1754" />
            </div>
            <div className="poster-dialog-actions">
              <button type="button" onClick={() => setPosterProduct(null)}>返回展示館</button>
              <a className="poster-github-link" href={posterProduct.githubUrl}>查看 GitHub <span aria-hidden="true">↗</span></a>
              <a href={posterProduct.demoUrl}>進入 Demo <span aria-hidden="true">↗</span></a>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
