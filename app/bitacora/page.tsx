import type { Metadata } from "next";
import { FIXED_CASE } from "../../lib/experiment";
import { getCounts } from "../../lib/events";
import { Scoreboard } from "../../components/scoreboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bitácora · Taller Norte", robots: { index: false, follow: false } };

export default function Bitacora() {
  const live = getCounts();
  return <main className="shell">
    <header className="topbar"><a className="mark" href="/practica">TN<span className="markDot">.</span></a>
      <nav><a href="/practica">Cursos</a><a href="/bitacora">Bitácora</a></nav>
    </header>
    <section className="journal"><div className="eyebrow">LABORATORIO 01 · EXPERIMENTO A/B</div>
      <h1>Bitácora del experimento.</h1>
      <p className="lead">Impresiones por sesión de 30 minutos. Conversiones únicas por visitante, desde el CTA.</p>
      <Scoreboard name="Eventos registrados" data={live} />
      <Scoreboard name="Caso de prueba fijo" data={FIXED_CASE} />
      <p className="footnote">Tasa = conversiones ÷ impresiones × 100. Sin impresiones, no existe una tasa. La diferencia B − A se expresa en puntos porcentuales. Estas cifras no permiten declarar un ganador.</p>
    </section>
  </main>;
}
