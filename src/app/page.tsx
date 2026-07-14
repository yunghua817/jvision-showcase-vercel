import { ShowcaseGallery } from "../components/showcase-gallery";
import { getManagedProducts } from "../lib/products-store";

const logoUrl = "https://www.jvision-ai.com/public/logo.png";

type HomeProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const products = (await getManagedProducts()).filter((product) => product.visible !== false);
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory = requestedCategory && categories.includes(requestedCategory)
    ? requestedCategory
    : "全部";

  const showcaseNames = ["人資薪酬招募管理", "生產工單", "理賠案件管理平台", "ESG 能源與碳管理平台"];
  const showcase = showcaseNames
    .map((name) => products.find((product) => product.name === name))
    .filter((product) => product !== undefined);

  const categoryOverview = categories.map((name) => ({
    name,
    count: products.filter((product) => product.category === name).length,
  }));

  return (
    <main className="curator-page">
      <div className="curator-shell">
        <header className="curator-header">
          <a className="curator-brand" href="#top" aria-label="Jvision Demo 展示館">
            <img src={logoUrl} alt="JVision" />
            <span><strong>Jvision Demo 展示館</strong><small>Interactive Product Collection</small></span>
          </a>
          <nav aria-label="主要導覽">
            <a href="#curator-categories">分類</a>
            <a href="#gallery">全部 Demo</a>
            <a href="https://github.com/yunghua817">我的 GitHub ↗</a>
            <a className="curator-nav-action" href="#gallery">開始探索</a>
          </nav>
        </header>

        <section className="curator-hero" id="top">
          <span className="curator-label">{products.length} Interactive Demos · {categories.length} Collections</span>
          <h1>一個地方，探索<br />Jvision 的每一套系統</h1>
          <p>從產業情境出發，看見系統如何真正運作。選一個感興趣的展品，直接進入 Demo 體驗。</p>
          <div className="curator-actions">
            <a href="#showcase">看看精選系統</a>
            <a href="#curator-categories">依分類探索</a>
          </div>
        </section>

        <section className="curator-showcase" id="showcase" aria-label="精選 Demo">
          {showcase.map((product, index) => (
            <a className={`curator-piece piece-${index + 1}`} href={product.demoUrl} key={product.slug}>
              <div className="piece-top"><span>{product.category}</span><small>0{index + 1}</small></div>
              <div className="piece-content">
                <strong>{product.name}</strong>
                <p>{product.description}</p>
              </div>
              <div className="piece-footer"><span>{product.module}</span><b>進入 Demo ↗</b></div>
            </a>
          ))}
        </section>

        <section className="curator-categories" id="curator-categories">
          <div className="curator-section-heading">
            <div><span>Explore by collection</span><h2>從工作情境開始選</h2></div>
            <p>點擊分類後，會直接帶你到該分類的完整專案清單。</p>
          </div>
          <div className="curator-category-grid">
            {categoryOverview.map((category, index) => (
              <a href={`/?category=${encodeURIComponent(category.name)}#gallery`} key={category.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.name}</strong>
                <small>{category.count} 套 Demo <b>→</b></small>
              </a>
            ))}
          </div>
        </section>
      </div>

      <ShowcaseGallery products={products} categories={categories} initialCategory={initialCategory} />

      <footer>
        <div><img src={logoUrl} alt="JVision" /><strong>Jvision Demo 展示館</strong></div>
        <span>{products.length} 套可操作的 Jvision 系統展示 · <a href="/admin">管理後台</a></span>
      </footer>
    </main>
  );
}
