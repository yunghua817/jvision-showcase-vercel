"use client";

import { useMemo, useState } from "react";
import type { Product } from "../data/products";

const tones = ["coral", "teal", "blue", "amber", "violet", "green"];

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-TW");
    return products.filter((product) => {
      const categoryMatch = category === "全部" || product.category === category;
      const text = `${product.name} ${product.module} ${product.description}`.toLocaleLowerCase("zh-TW");
      return categoryMatch && (!needle || text.includes(needle));
    });
  }, [category, products, query]);

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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋系統、功能或產業，例如：人資、庫存、照護"
              aria-label="搜尋 Demo"
            />
          </label>
          <div className="category-list" aria-label="Demo 分類">
            {["全部", ...categories].map((item) => (
              <button
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="result-row">
          <strong>{filtered.length} 個 Demo</strong>
          <span>{category === "全部" ? "顯示所有分類" : `目前分類：${category}`}</span>
        </div>

        {filtered.length ? (
          <div className="gallery-grid">
            {filtered.map((product, index) => (
              <article className="demo-card" key={product.slug}>
                <a className="card-main" href={product.demoUrl} aria-label={`開啟 ${product.name} Demo`}>
                  <div className={`card-visual tone-${tones[index % tones.length]}`}>
                    <span>{product.category}</span>
                    <b>{String(product.id).padStart(2, "0")}</b>
                    <strong>{product.name}</strong>
                    <i>JV</i>
                  </div>
                  <div className="card-copy">
                    <div className="card-meta">
                      <span>{product.category}</span>
                      <span className="live-dot">可直接體驗</span>
                    </div>
                    <h3>{product.name}</h3>
                    <p>{product.description.replace(/ Demo$/i, "")}</p>
                    <small>{product.module}</small>
                  </div>
                </a>
                <a className="open-demo" href={product.demoUrl}>
                  進入 Demo <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>目前找不到符合的 Demo</strong>
            <p>可以換一個關鍵字，或切回「全部」分類。</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("全部"); }}>清除篩選</button>
          </div>
        )}
      </section>
    </>
  );
}
