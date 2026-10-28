<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in a merged ticket. Unlike CauseTable, a one-day move is its own problem,
  // not a footnote under the cause its tenant would have.
  let { ticket, tickets }: { ticket: number; tickets: Record<string, string> } = $props();

  type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';
  const problemOf = (r: Report): Problem =>
    notes.oneDayMove.includes(r.id) ? 'one-day' : (causeOf(r, tenantOf(r)) ?? 'unplaced');

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived.by(() => {
    const by = new Map<Problem, Report[]>();
    for (const r of merged) by.set(problemOf(r), [...(by.get(problemOf(r)) ?? []), r]);
    return [...by.entries()]
      .map(([problem, rs]) => {
        const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
        return { problem, n: rs.length, tenants: new Set(rs.map((r) => r.tenant)).size, first: days[0], last: days[days.length - 1] };
      })
      .sort((a, b) => b.n - a.n);
  });
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} · <strong>{rows.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>{r.n}</td>
        <td>{r.tenants}</td>
        <td>{r.first} → {r.last}</td>
        <td>{#if tickets[r.problem]}<a href={tickets[r.problem]}>{tickets[r.problem].split('/').slice(-3).join(' ')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
