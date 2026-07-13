import { ShowcaseGallery } from "../components/showcase-gallery";
import { categories, products } from "../data/products";

const logoUrl = "https://www.jvision-ai.com/public/logo.png";

type HomeProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory = requestedCategory && categories.includes(requestedCategory)
    ? requestedCategory
    : "全部";

  const featuredNames = ["人資薪酬招募管理", "理賠案件管理平台", "ESG 能源與碳管理平台"];
  const featured = featuredNames
    .map((name) => products.find((product) => product.name === name))
    .filter((product) => product !== undefined);

  const categoryOverview = categories.map((name) => ({
    name,
    count: products.filter((product) => product.category === name).length,
  }));

  return (
    <main className="museum-page">
      <div className="museum-shell">
        <header className="museum-header">
          <a className="museum-brand" href="#top" aria-label="Jvision 產品展示館">
            <span className="museum-brand-mark"><img src={logoUrl} alt="JVision" /></span>
            <span>
              <strong>Jvision 產品展示館</strong>
              <small>把系統價值說清楚，也展示得更漂亮</small>
            </span>
          </a>
          <nav aria-label="主要導覽">
            <a href="#category-overview">分類導覽</a>
            <a href="#gallery">產品總覽</a>
          </nav>
        </header>

        <section className="museum-hero" id="top">
          <div className="museum-copy">
            <span className="museum-pill">Curated Demo Library</span>
            <h1>每一套系統，<br />都值得被好好看見。</h1>
            <p className="museum-lead">每一個功能，都藏著一段工作故事。<br />我們把它整理成容易理解的展示。</p>
            <p className="museum-description">Jvision 將不同產業與工作情境的 Demo 集中在一座展示館。從第一眼的印象、系統說明到實際操作入口，讓產品能被導覽、比較，也能慢慢被理解。</p>
            <div className="museum-actions">
              <a className="museum-primary" href="#gallery">開始看產品</a>
              <a className="museum-secondary" href="#category-overview">先看分類</a>
            </div>
            <div className="museum-stats">
              <article><strong>{products.length}</strong><span>可操作的 Demo</span></article>
              <article><strong>{categories.length}</strong><span>情境分類</span></article>
              <article><strong>RWD</strong><span>支援手機展示</span></article>
            </div>
          </div>

          <div className="museum-wall" aria-label="精選產品展示">
            {featured.map((product, index) => (
              <a className={`museum-exhibit exhibit-${index + 1}`} href={product.demoUrl} key={product.slug}>
                <div className="exhibit-art">
                  <span>{product.category}</span>
                  <strong>{product.name}</strong>
                </div>
                <div className="exhibit-copy">
                  <span>{product.category}</span>
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                  <small>{product.module}</small>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="museum-guide">
          <div>
            <span className="museum-kicker">觀看方式</span>
            <h2>先被氣質吸引，再走進內容裡面</h2>
          </div>
          <div className="museum-guide-grid">
            <article><span>01</span><strong>先看產業與場景</strong><p>快速感受產品屬於哪種工作情境，第一眼就有方向。</p></article>
            <article><span>02</span><strong>再讀系統內容</strong><p>從功能說明理解系統可以解決什麼問題。</p></article>
            <article><span>03</span><strong>最後直達 Demo</strong><p>有興趣就直接進入正式畫面，不必再翻找連結。</p></article>
          </div>
        </section>

        <section className="museum-categories" id="category-overview">
          <div className="museum-section-heading">
            <span className="museum-kicker">分類導覽</span>
            <h2>先看產業與場景，再選擇對應的系統。</h2>
            <p>每個分類都像一個展區，讓觀看、介紹與比較更有節奏。</p>
          </div>
          <div className="museum-category-grid">
            {categoryOverview.map((category) => (
              <a href={`/?category=${encodeURIComponent(category.name)}#gallery`} key={category.name}>
                <span>探索</span>
                <strong>{category.name}</strong>
                <small>{category.count} 個展示頁</small>
              </a>
            ))}
          </div>
        </section>
      </div>

      <ShowcaseGallery products={products} categories={categories} initialCategory={initialCategory} />

      <footer>
        <div><img src={logoUrl} alt="JVision" /><strong>Jvision 產品展示館</strong></div>
        <span>讓每一套系統，都有被看見與理解的機會。</span>
      </footer>
    </main>
  );
}
