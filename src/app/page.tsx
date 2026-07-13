import { ShowcaseGallery } from "../components/showcase-gallery";
import { categories, products } from "../data/products";

const logoUrl = "https://www.jvision-ai.com/public/logo.png";

export default function Home() {
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
        <div className="hero-copy">
          <p className="eyebrow">Jvision Interactive Demo Gallery</p>
          <h1>看見每一套系統，<em>真正運作</em>的樣子。</h1>
          <p>這裡不是只有功能清單。你可以依照產業與工作情境探索，直接進入每一套 Jvision Demo 操作流程。</p>
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
        <div className="hero-display" aria-label="展示館精選系統">
          <div className="display-top"><span /><span /><span /><b>Jvision Gallery</b></div>
          <div className="display-feature">
            <span>本月精選</span>
            <strong>智慧門市 POS</strong>
            <p>從收銀到營運分析，一個畫面完整體驗。</p>
          </div>
          <div className="display-row">
            <div><span>企業營運</span><b>人資薪酬招募</b></div>
            <div><span>製造工程</span><b>設備維護管理</b></div>
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
