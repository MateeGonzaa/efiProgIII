import Link from "next/link";
import { getProducts } from "@/lib/api";
import { mockProducts } from "@/lib/mock-data";
import type { ProductDetails } from "@/lib/types";
import { pickForCategory } from "@/lib/categories";
import { ApiBanner } from "@/components/status";
import { ProductShelf } from "@/components/product-shelf";
import { SectionHeading } from "@/components/section-heading";
import { Marquee } from "@/components/marquee";
import { CategoryTile } from "@/components/category-tile";
import { ProductCover } from "@/components/product-cover";
import { Icon } from "@/components/icon";

export default async function HomePage() {
  let products: ProductDetails[] = mockProducts;
  let demo = true;
  try {
    const data = await getProducts();
    if (data.results.length) products = data.results;
    demo = false;
  } catch { demo = true; }
  const featured = products.slice(0, 4);
  const feature = products[2] ?? mockProducts[2];

  return <>
    <section className="hero-shell">
      <div className="hero-grid-lines" aria-hidden="true"/>
      <div className="hero-copy">
        <span className="hero-label"><i/> Tienda de cómics, manga y libros</span>
        <h1><span>Leé algo</span><em>que te enganche.</em></h1>
        <p>Cómics, manga y libros para leer, coleccionar y recomendar. Armá tu pedido y te lo mandamos a donde estés.</p>
        <div className="hero-actions"><Link href="/catalogo" className="button button-primary">Ver el catálogo <Icon name="arrow" size={17}/></Link><Link href="/catalogo?categoria=manga" className="button button-secondary">Ir a manga</Link></div>
      </div>
      <div className="hero-art" aria-label="Portadas destacadas">
        <div className="hero-cover hero-cover-back"><ProductCover product={products[1] ?? mockProducts[1]}/></div>
        <div className="hero-cover hero-cover-mid"><ProductCover product={products[3] ?? mockProducts[3]}/></div>
        <div className="hero-cover hero-cover-front"><ProductCover product={feature}/></div>
      </div>
    </section>

    <Marquee products={products}/>

    <section className="manifesto-strip"><div><span>01</span><strong>Todo en un solo lugar</strong><small>Cómics, manga y libros.</small></div><div><span>02</span><strong>Stock a la vista</strong><small>Sabés qué hay antes de pedir.</small></div><div><span>03</span><strong>Envíos a todo el país</strong><small>De Córdoba a tu casa.</small></div></section>

    <section className="store-section collection-section"><SectionHeading eyebrow="Destacados" title="Para ir empezando" body="Una selección del catálogo para arrancar." action={<Link href="/catalogo" className="text-link">Ver todo el catálogo <Icon name="arrow" size={15}/></Link>}/>{demo && <ApiBanner/>}<ProductShelf products={featured}/></section>

    <section className="feature-spread"><div className="feature-copy"><span className="eyebrow">Edición destacada</span><h2>{feature.titulo}</h2><p>Una edición del catálogo para sumar a tu colección. Mirá el detalle, el precio y cuántos ejemplares quedan.</p><Link href={`/catalogo/${feature.id}`} className="feature-link">Ver esta edición <Icon name="arrow" size={16}/></Link></div><div className="feature-visual"><ProductCover product={feature}/></div></section>

    <section className="store-section category-section"><SectionHeading eyebrow="Categorías" title="¿Qué querés leer?" body="Tres estantes para recorrer. Elegí uno y mirá todo lo que hay."/><div className="cat-grid">
      <CategoryTile kind="comic" seed={0} href="/catalogo?categoria=comics" tag="Cómics" title="Superhéroes y clásicos de siempre" description="Sagas, números históricos y ediciones coleccionables de las grandes editoriales." cta="Ver cómics" products={pickForCategory(products, "comics")}/>
      <CategoryTile kind="manga" seed={1} href="/catalogo?categoria=manga" tag="Manga" title="Un tomo más y me voy a dormir" description="Series que se leen de a tomos: aventura, acción y todo lo que viene de Japón." cta="Ver manga" products={pickForCategory(products, "manga")}/>
      <CategoryTile kind="fantasy" seed={2} href="/catalogo?categoria=libros" tag="Libros" title="Fantasía, ciencia ficción y sagas" description="Novelas para perderse varios días en otros mundos, desde los clásicos hasta lo nuevo." cta="Ver libros" products={pickForCategory(products, "libros")}/>
    </div></section>

    <section className="cta-band"><div><span className="eyebrow">Tu pedido</span><h2>Elegí, sumá al carrito y listo.</h2><p>Con tu cuenta podés guardar tus datos de envío y seguir el estado de cada pedido.</p></div><div className="cta-actions"><Link href="/catalogo" className="button button-primary">Ir al catálogo <Icon name="arrow" size={16}/></Link><Link href="/registro" className="button button-secondary">Crear mi cuenta</Link></div></section>
  </>;
}