import { ShowcaseGallery } from "../components/showcase-gallery";
import { categories, products } from "../data/products";

const logoUrl = "https://www.jvision-ai.com/public/logo.png";

export default function Home() {
  const categoryOverview = categories.map((name) => ({
    name,
    count: products.filter((product) => product.category === name).length,
  }));

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jvision Demo 展示館">
          <img src={logoUrl} alt="JVision" />
          <span>
            <strong>Jvision Demo 展示館</strong>
            <small>把好系統帶到你面前</small>
          </span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#highlights">展館特色</a>
          <a href="#gallery">全部 Demo</a>
          <a className="nav-action" href="#gallery">開始探索</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-intro">
          <p className="eyebrow">Jvision Interactive Demo Center</p>
          <h1><em>{products.length} 套系統</em>，<br />集中在一個展示館。</h1>
          <p>從企業營運、製造工程到零售服務，依照你關心的工作情境開始探索，直接進入可操作的 Jvision Demo。</p>
          <div className="hero-actions">
            <a className="primary-button" href="#gallery">探索全部 Demo</a>
            <a className="secondary-button" href="#highlights">了解展示方式</a>
          </div>
          <div className="hero-stats">
            <span><b>{products.length}</b><small>互動 Demo</small></span>
            <span><b>{categories.length}</b><small>應用分類</small></span>
            <span><b>RWD</b><small>手機也能體驗</small></span>
          </div>
        </div>

        <div className="hero-catalog" aria-label="Demo 應用分類">
          <div className="hero-catalog-heading">
            <span>Browse the collection</span>
            <strong>依照工作情境快速進入</strong>
          </div>
          <div className="hero-category-grid">
            {categoryOverview.map((category, index) => (
              <a href="#gallery" key={category.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{category.name}</b>
                <small>{category.count} 個 Demo</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="highlights" id="highlights">
        <div className="section-heading">
          <p className="eyebrow">不只看介紹</p>
          <h2>用最直覺的方式，找到值得體驗的系統</h2>
        </div>
        <div className="highlight-grid">
          <article><span>01</span><h3>依照情境探索</h3><p>用產業分類與關鍵字，快速縮小選擇範圍。</p></article>
          <article><span>02</span><h3>直接操作流程</h3><p>每張卡片都連到正式 Demo，不停留在靜態說明。</p></article>
          <article><span>03</span><h3>手機也能展示</h3><p>會議、拜訪或分享連結時，都能保持清楚好讀。</p></article>
        </div>
      </section>

      <ShowcaseGallery products={products} categories={categories} />

      <footer>
        <div><img src={logoUrl} alt="JVision" /><strong>Jvision Demo 展示館</strong></div>
        <span>從需求出發，找到下一套適合你的系統。</span>
      </footer>
    </main>
  );
}
