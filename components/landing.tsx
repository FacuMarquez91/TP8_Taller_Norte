import { CONTENT, OFFER, type Variant } from "../lib/experiment";
import { registerConversion } from "../app/practica/actions";

export function Landing({ variant, preview, confirmed }: {
  variant: Variant; preview: boolean; confirmed: boolean;
}) {
  const copy = CONTENT[variant];
  return <main className="shell">
    <header className="topbar"><span className="mark">TN<span className="markDot">.</span></span>
      <nav aria-label="Navegación"><a href="/practica">Cursos</a><a href="/bitacora">Bitácora</a></nav>
    </header>
    <section className="hero">
      <div className="eyebrow">TALLER NORTE <span>·</span> ESCUELA DE OFICIOS</div>
      <h1>{copy.headline}</h1>
      <p className="lead">{copy.subheadline}</p>
      <form action={registerConversion}>
        <input type="hidden" name="preview" value={preview ? "1" : "0"} />
        <input type="hidden" name="variant" value={variant} />
        <button className="cta" type="submit">{copy.cta} <span aria-hidden>↗</span></button>
      </form>
      {confirmed && !preview ? <p className="success" role="status">Se registró tu interés. El cupo no se reserva automáticamente.</p> : null}
      {preview ? <p className="preview">Vista previa de mensaje {variant.toUpperCase()} · No se registra como impresión ni conversión.</p> : null}
      <div className="offer">
        <div><span>COMIENZO</span><strong>{OFFER.start}</strong></div>
        <div><span>DURACIÓN</span><strong>{OFFER.duration}</strong></div>
        <div><span>CUPO POR GRUPO</span><strong>{OFFER.capacity}</strong></div>
      </div>
    </section>
    <section className="trades"><div className="sectionLabel">APRENDER HACIENDO</div>
      <h2>Elegí tu próximo oficio.</h2><div className="tradeGrid">
        {OFFER.trades.map((trade, index) => <div className="trade" key={trade}>
          <span className="tradeNum">0{index + 1}</span><h3>{trade}</h3><p>Clases prácticas, durante ocho semanas, en grupos de doce.</p>
        </div>)}
      </div>
    </section>
    <footer>Una oferta, dos mensajes, una sola página. <a href="/bitacora">Ver bitácora del experimento</a></footer>
  </main>;
}
