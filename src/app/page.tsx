import { ShowcaseGallery } from "../components/showcase-gallery";
import { categories, products } from "../data/products";

const logoUrl = "https://www.jvision-ai.com/public/logo.png";

export default function Home() {
  const featured = ["人資薪酬招募管理", "理賠案件管理平台", "ESG 能源與碳管理平台"]
    .map((name) => products.find((product) => product.name === name))
    .filter((product) => product !== undefined);

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
          <a href="#featured">精選 Demo</a>
          <a href="#gallery">全部 Demo</a>
          <a className="nav-action" href="#gallery">開始探索</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="hero-label">Jvision Product Gallery</span>
          <h1>找到適合你的<br />數位工作系統</h1>
          <p>集中瀏覽 Jvision 在製造、營運、服務與永續領域的互動 Demo。選一個情境，直接開始操作。</p>
          <a className="primary-button" href="#gallery">瀏覽全部系統 <span>→</span></a>
        </div>
        <div className="hero-summary" aria-label="展示館資料摘要">
          <div className="summary-lead">
            <span>Demo Collection</span>
            <strong>{products.length}</strong>
            <p>套可操作的系統展示</p>
          </div>
          <div className="summary-list">
            <div><span>應用分類</span><b>{categories.length} 類</b></div>
            <div><span>瀏覽方式</span><b>搜尋與篩選</b></div>
            <div><span>裝置支援</span><b>桌機・手機</b></div>
          </div>
        </div>
      </section>

      <section className="featured" id="featured">
        <div className="featured-heading">
          <div>
            <p className="eyebrow">Featured Demos</p>
            <h2>先從這些系統開始</h2>
          </div>
          <a href="#gallery">查看全部 {products.length} 套 Demo →</a>
        </div>
        <div className="featured-grid">
          {featured.map((product, index) => (
            <a className={`featured-card featured-card-${index + 1}`} href={product.demoUrl} key={product.slug}>
              <div className="featured-meta">
                <span>{product.category}</span>
                <small>0{index + 1}</small>
              </div>
              <div>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
                <b>進入 Demo <span>↗</span></b>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="highlights" id="highlights">
        <div className="section-heading">
          <p className="eyebrow">Browse with ease</p>
          <h2>清楚分類，直接操作</h2>
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
