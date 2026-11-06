import Link from "next/link";
import { getProducts } from "@/lib/api";
import { mockProducts } from "@/lib/mock-data";
import type { ProductDetails } from "@/lib/types";
import { ApiBanner } from "@/components/status";
import { ProductShelf } from "@/components/product-shelf";
import { SectionHeading } from "@/components/section-heading";
import { Marquee } from "@/components/marquee";
import { CoverArt } from "@/components/cover-art";
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
        <span className="hero-label"><i/> TIENDA DE CÓMICS, MANGA Y LIBROS</span>
        <h1><span>Leé algo</span><em>que te enganche.</em></h1>
        <p>Cómics, manga y libros para leer, coleccionar y recomendar. Armá tu pedido y te lo mandamos a donde estés.</p>
        <div className="hero-actions"><Link href="/catalogo" className="button button-primary">Ver el catálogo <Icon name="arrow" size={17}/></Link><span className="hero-note"><Icon name="spark" size={15}/> Cómics, manga y libros</span></div>
        <div className="hero-index"><span>01 / 03</span><span className="hero-index-line"/><span>TINTA Y PAPEL</span></div>
      </div>
      <div className="hero-art" aria-label="Portadas destacadas">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="orbit-coord">CÓRDOBA<br/>ARGENTINA</span>
        <div className="hero-cover hero-cover-back"><ProductCover product={products[1] ?? mockProducts[1]}/></div>
        <div className="hero-cover hero-cover-mid"><ProductCover product={products[3] ?? mockProducts[3]}/></div>
        <div className="hero-cover hero-cover-front"><ProductCover product={feature}/></div>
        <div className="hero-art-stamp"><span>DESDE CÓRDOBA</span><strong>A TODO<br/>EL<br/>PAÍS</strong><small>CON ENVÍO</small></div>
        <span className="hero-art-caption">ALGUNAS EDICIONES DEL CATÁLOGO</span>
      </div>
      <div className="hero-footer"><span>ELEGÍ, ARMÁ TU PEDIDO Y LEÉ.</span><span>BAJÁ PARA VER MÁS <i/></span></div>
    </section>

    <Marquee products={products}/>

    <section className="manifesto-strip"><div><span>01</span><strong>Todo en un solo lugar</strong><small>Cómics, manga y libros.</small></div><div><span>02</span><strong>Stock a la vista</strong><small>Sabés qué hay antes de pedir.</small></div><div><span>03</span><strong>Envíos a todo el país</strong><small>De Córdoba a tu casa.</small></div><Icon name="spark" size={22}/></section>

    <section className="store-section collection-section"><div className="section-topline"><span>ESTANTE 01 · DESTACADOS</span><span>SELECCIÓN DE LA CASA</span></div><SectionHeading eyebrow="DESTACADOS" title="Para ir empezando" body="Una selección del catálogo para arrancar." action={<Link href="/catalogo" className="text-link">Ver todo el catálogo <Icon name="arrow" size={15}/></Link>}/>{demo && <ApiBanner/>}<ProductShelf products={featured}/></section>

    <section className="feature-spread"><div className="feature-copy"><span className="eyebrow">EDICIÓN DESTACADA</span><h2>{feature.titulo}</h2><p>Una edición del catálogo para sumar a tu colección. Mirá el detalle, el precio y cuántos ejemplares quedan.</p><Link href={`/catalogo/${feature.id}`} className="feature-link">Ver esta edición <Icon name="arrow" size={16}/></Link><div className="feature-stamp">EDICIÓN<br/><strong>PARA<br/>TU<br/>ESTANTE</strong><span>FC · 2026</span></div></div><div className="feature-visual"><ProductCover product={feature}/><span className="feature-orbit-label">EDICIÓN DESTACADA<br/>LA FRIKICUEVA</span><span className="feature-index">[ DESTACADO ]</span></div></section>

    <section className="store-section category-section"><div className="section-topline"><span>COMPRÁ POR CATEGORÍA</span><span>ELEGÍ UNA</span></div><SectionHeading eyebrow="CATEGORÍAS" title="¿Qué querés leer?"/><div className="category-grid">
      <Link href="/catalogo?categoria=comics" className="category-tile category-comic"><CoverArt kind="comic" seed={0} className="tile-art"/><span className="category-number">01 / TINTA</span><div><span>CÓMIC</span><strong>Superhéroes y<br/>clásicos de siempre.</strong><small>VER CÓMICS <Icon name="arrow" size={14}/></small></div><span className="category-symbol">✳</span></Link>
      <Link href="/catalogo?categoria=manga" className="category-tile category-manga"><CoverArt kind="manga" seed={1} className="tile-art"/><span className="category-number">02 / TRAZO</span><div><span>MANGA</span><strong>Un tomo más<br/>y me voy a dormir.</strong><small>VER MANGA <Icon name="arrow" size={14}/></small></div><span className="category-symbol">◈</span></Link>
      <Link href="/catalogo?categoria=libros" className="category-tile category-fantasy"><CoverArt kind="fantasy" seed={2} className="tile-art"/><span className="category-number">03 / PÁGINAS</span><div><span>LIBROS</span><strong>Fantasía, ciencia<br/>ficción y sagas.</strong><small>VER LIBROS <Icon name="arrow" size={14}/></small></div><span className="category-symbol">✧</span></Link>
    </div></section>

    <section className="newsletter-section"><div className="newsletter-orbit"/><div><span className="eyebrow">NOVEDADES</span><h2>Enterate primero<br/>de lo que llega.</h2><p>Dejanos tu mail y te avisamos cuando haya nuevas ediciones y novedades.</p></div><form className="newsletter-form" action="mailto:hola@lafrikicueva.com" method="get"><label className="sr-only" htmlFor="newsletter-email">Tu mail</label><input id="newsletter-email" type="email" placeholder="tu@mail.com" required/><button className="button button-primary" type="submit">Sumarme <Icon name="arrow" size={16}/></button><small>SIN SPAM. SOLO NOVEDADES.</small></form></section>
  </>;
}