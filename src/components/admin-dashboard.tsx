"use client";

import { useMemo, useState } from "react";
import type { Product } from "../data/products";

type Props = { initialProducts: Product[] };

const emptyProduct = (id: number): Product => ({
  id, name: "新 Demo", module: "", description: "", demoUrl: "https://",
  githubUrl: "https://github.com/yunghua817/", posterUrl: "", category: "企業營運",
  slug: `new-demo-${id}`, visible: true,
});

export function AdminDashboard({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState(initialProducts[0]?.id ?? 0);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedIndex = products.findIndex((product) => product.id === selectedId);
  const selected = products[selectedIndex];
  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return keyword ? products.filter((product) => `${product.name} ${product.category} ${product.module}`.toLowerCase().includes(keyword)) : products;
  }, [products, query]);

  function updateSelected(field: keyof Product, value: string | boolean) {
    setProducts((current) => current.map((product) => product.id === selectedId ? { ...product, [field]: value } : product));
  }

  function addProduct() {
    const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
    setProducts((current) => [...current, emptyProduct(nextId)]);
    setSelectedId(nextId); setQuery(""); setMessage("已新增草稿，完成內容後請按儲存");
  }

  function removeProduct() {
    if (!selected || !window.confirm(`確定刪除「${selected.name}」？`)) return;
    const remaining = products.filter((product) => product.id !== selected.id);
    setProducts(remaining); setSelectedId(remaining[0]?.id ?? 0);
    setMessage("已從清單移除，按儲存後才會正式生效");
  }

  function moveSelected(direction: -1 | 1) {
    const destination = selectedIndex + direction;
    if (selectedIndex < 0 || destination < 0 || destination >= products.length) return;
    const reordered = [...products];
    [reordered[selectedIndex], reordered[destination]] = [reordered[destination], reordered[selectedIndex]];
    setProducts(reordered);
  }

  async function save() {
    setBusy(true); setMessage("儲存中…");
    const response = await fetch("/api/admin/products", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `已儲存 ${products.length} 個 Demo` : data.message || "儲存失敗");
    setBusy(false);
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><span>Jvision Showcase</span><h1>Demo 管理後台</h1><p>共 {products.length} 個專案，變更後請按「儲存全部」。</p></div>
        <div className="admin-header-actions"><a href="/">← 返回展示館</a></div>
      </header>
      <div className="admin-workspace">
        <aside className="admin-list-panel">
          <div className="admin-list-tools"><input aria-label="搜尋 Demo" placeholder="搜尋名稱、分類或模組" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" onClick={addProduct}>＋ 新增 Demo</button></div>
          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <button type="button" className={product.id === selectedId ? "is-active" : ""} onClick={() => setSelectedId(product.id)} key={product.id}>
                <span>{product.name}<small>{product.category}</small></span><i className={product.visible === false ? "is-hidden" : ""}>{product.visible === false ? "隱藏" : "公開"}</i>
              </button>
            ))}
          </div>
        </aside>
        <section className="admin-editor">
          {selected ? <>
            <div className="admin-editor-title"><div><span>編輯 Demo #{selected.id}</span><h2>{selected.name}</h2></div><div><button type="button" onClick={() => moveSelected(-1)} disabled={selectedIndex === 0}>↑ 上移</button><button type="button" onClick={() => moveSelected(1)} disabled={selectedIndex === products.length - 1}>↓ 下移</button></div></div>
            <div className="admin-form-grid">
              <label>專案名稱<input value={selected.name} onChange={(event) => updateSelected("name", event.target.value)} /></label>
              <label>分類<input value={selected.category} onChange={(event) => updateSelected("category", event.target.value)} /></label>
              <label>英文模組名稱<input value={selected.module} onChange={(event) => updateSelected("module", event.target.value)} /></label>
              <label>網址代稱（slug）<input value={selected.slug} onChange={(event) => updateSelected("slug", event.target.value)} /></label>
              <label className="admin-field-wide">簡短說明<textarea rows={3} value={selected.description} onChange={(event) => updateSelected("description", event.target.value)} /></label>
              <label className="admin-field-wide">Demo 網址<input type="url" value={selected.demoUrl} onChange={(event) => updateSelected("demoUrl", event.target.value)} /></label>
              <label className="admin-field-wide">GitHub 網址<input type="url" value={selected.githubUrl} onChange={(event) => updateSelected("githubUrl", event.target.value)} /></label>
              <label className="admin-field-wide">海報網址（可留白使用內建海報）<input value={selected.posterUrl || ""} onChange={(event) => updateSelected("posterUrl", event.target.value)} placeholder="/posters/example.png 或 https://…" /></label>
            </div>
            <label className="admin-visibility"><input type="checkbox" checked={selected.visible !== false} onChange={(event) => updateSelected("visible", event.target.checked)} /><span><strong>公開顯示</strong><small>關閉後，這個 Demo 不會出現在公開展示館。</small></span></label>
            <div className="admin-editor-footer"><button type="button" className="admin-delete" onClick={removeProduct}>刪除這個 Demo</button><button type="button" className="admin-save" onClick={save} disabled={busy}>{busy ? "處理中…" : "儲存全部變更"}</button></div>
            {message && <div className="admin-status" aria-live="polite">{message}</div>}
          </> : <div className="admin-empty">請從左側選擇 Demo，或新增一筆資料。</div>}
        </section>
      </div>
    </main>
  );
}
