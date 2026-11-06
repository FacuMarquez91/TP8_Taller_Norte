import { conversionRate, formatRate, formatDifference } from "../lib/experiment";
import type { Counts } from "../lib/events";

export function Scoreboard({ name, data }: {
  name: string; data: { a: Counts; b: Counts };
}) {
  const rateA = conversionRate(data.a.impressions, data.a.conversions);
  const rateB = conversionRate(data.b.impressions, data.b.conversions);
  return <section className="scoreboard"><h2>{name}</h2>
    <div className="tableWrap"><table>
      <thead><tr><th>Variante</th><th>Impresiones</th><th>Conversiones</th><th>Tasa</th></tr></thead>
      <tbody>
        <tr><th scope="row">A · Control</th><td>{data.a.impressions}</td><td>{data.a.conversions}</td><td>{formatRate(rateA)}</td></tr>
        <tr><th scope="row">B · Tratamiento</th><td>{data.b.impressions}</td><td>{data.b.conversions}</td><td>{formatRate(rateB)}</td></tr>
        <tr className="difference"><th scope="row">B − A</th><td>—</td><td>—</td><td>{formatDifference(rateA, rateB)}</td></tr>
      </tbody>
    </table></div>
  </section>;
}
