import Link from "next/link";
import { getProducts } from "@/lib/api";
import { mockProducts } from "@/lib/mock-data";
import type { ProductDetails } from "@/lib/types";
import { ApiBanner } from "@/components/status";
import { ProductShelf } from "@/components/product-shelf";
import { SectionHeading } from "@/components/section-heading";
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
        <span className="hero-label"><i/> LA TIENDA PARA OTRAS REALIDADES</span>
        <h1><span>Perdéte.</span><em>Encontráte.</em></h1>
        <p>Una buena historia abre una puerta. En La Frikicueva, encontrás la llave de tu próximo universo.</p>
        <div className="hero-actions"><Link href="/catalogo" className="button button-primary">Explorar el archivo <Icon name="arrow" size={17}/></Link><span className="hero-note"><Icon name="spark" size={15}/> Cómics, manga y fantasía</span></div>
        <div className="hero-index"><span>01 / 03</span><span className="hero-index-line"/><span>UNIVERSOS EN PAPEL</span></div>
      </div>
      <div className="hero-art" aria-label="Selección de historias ilustradas">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="orbit-coord">31°25&apos;S<br/>64°11&apos;W</span>
        <div className="hero-cover hero-cover-back"><ProductCover product={products[1] ?? mockProducts[1]}/></div>
        <div className="hero-cover hero-cover-mid"><ProductCover product={products[3] ?? mockProducts[3]}/></div>
        <div className="hero-cover hero-cover-front"><ProductCover product={feature}/></div>
        <div className="hero-art-stamp"><span>DESDE</span><strong>EL<br/>OTRO<br/>LADO</strong><small>DEL ESTANTE</small></div>
        <span className="hero-art-caption">FIG. 001 — PORTALES DE PAPEL</span>
      </div>
      <div className="hero-footer"><span>BAJÁ LA GUARDIA. ABRÍ UN LIBRO.</span><span>SCROLL PARA DESCUBRIR <i/></span></div>
    </section>

    <section className="manifesto-strip"><div><span>01</span><strong>Historias con carácter</strong><small>Elegidas para quedarse.</small></div><div><span>02</span><strong>Universos infinitos</strong><small>Una página más y listo.</small></div><div><span>03</span><strong>De la cueva a tu casa</strong><small>Envíos a todo el país.</small></div><Icon name="spark" size={22}/></section>

    <section className="store-section collection-section"><div className="section-topline"><span>ESTANTERÍA 01 · LO QUE NOS MUEVE</span><span>06 / ∞</span></div><SectionHeading eyebrow="TESOROS DE LA CUEVA" title="Elegidos para vos" body="Un puñado de mundos que vale la pena visitar." action={<Link href="/catalogo" className="text-link">Ver todo el catálogo <Icon name="arrow" size={15}/></Link>}/>{demo && <ApiBanner/>}<ProductShelf products={featured}/></section>

    <section className="feature-spread"><div className="feature-copy"><span className="eyebrow">LA HISTORIA DESTACADA · Nº 03</span><h2>Las grandes aventuras empiezan con una página.</h2><p>Hay mundos que te esperan en silencio. Historias llenas de mapas imposibles, héroes improbables y finales que todavía no conocés.</p><Link href={`/catalogo/${feature.id}`} className="feature-link">Descubrir esta edición <Icon name="arrow" size={16}/></Link><div className="feature-stamp">LECTURAS<br/><strong>QUE<br/>DEJAN<br/>MARCA</strong><span>FC · 2026</span></div></div><div className="feature-visual"><ProductCover product={feature}/><span className="feature-orbit-label">OBJETO DE COLECCIÓN<br/>SERIE 001 — ARGENTINA</span><span className="feature-index">[ 03 — 06 ]</span></div></section>

    <section className="store-section category-section"><div className="section-topline"><span>HAY UNA HISTORIA PARA VOS</span><span>ELIGÍ TU PORTAL</span></div><SectionHeading eyebrow="TRES PUERTAS DE ENTRADA" title="¿A dónde viajamos?"/><div className="category-grid">
      <Link href="/catalogo?categoria=1" className="category-tile category-comic"><span className="category-number">01 / TINTA</span><div><span>CÓMIC</span><strong>Héroes, mundos<br/>y otras leyendas.</strong><small>EXPLORAR CÓMICS <Icon name="arrow" size={14}/></small></div><span className="category-symbol">✳</span></Link>
      <Link href="/catalogo?categoria=2" className="category-tile category-manga"><span className="category-number">02 / TRAZO</span><div><span>MANGA</span><strong>Una viñeta más.<br/>Y no paramos.</strong><small>EXPLORAR MANGA <Icon name="arrow" size={14}/></small></div><span className="category-symbol">◈</span></Link>
      <Link href="/catalogo?categoria=3" className="category-tile category-fantasy"><span className="category-number">03 / MUNDO</span><div><span>FANTASÍA ÉPICA</span><strong>Mapas para<br/>perderse bien.</strong><small>EXPLORAR FANTASÍA <Icon name="arrow" size={14}/></small></div><span className="category-symbol">✧</span></Link>
    </div></section>

    <section className="newsletter-section"><div className="newsletter-orbit"/><div><span className="eyebrow">MENSAJE DESDE EL OTRO LADO</span><h2>La próxima gran historia<br/>puede llegar a tu inbox.</h2><p>Novedades, nuevas ediciones y señales de vida desde la cueva.</p></div><form className="newsletter-form" action="mailto:hola@lafrikicueva.com" method="get"><label className="sr-only" htmlFor="newsletter-email">Tu email</label><input id="newsletter-email" type="email" placeholder="tu@email.com" required/><button className="button button-primary" type="submit">Sumarme <Icon name="arrow" size={16}/></button><small>POCO RUIDO. BUENAS HISTORIAS.</small></form></section>
  </>;
}
