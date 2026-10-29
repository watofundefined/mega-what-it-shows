<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in a merged ticket, and the ticket that covers it. A problem is a cause, as
  // causeOf() ties a report to it; a one-day move stays under its cause, footnoted as CauseTable does.
  let { ticket, tickets }: { ticket: number; tickets: Record<string, string> } = $props();

  type Problem = 'parser' | 'hint' | 'unplaced';
  const problemOf = (r: Report): Problem => causeOf(r, tenantOf(r)) ?? 'unplaced';

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived.by(() => {
    const by = new Map<Problem, Report[]>();
    for (const r of merged) by.set(problemOf(r), [...(by.get(problemOf(r)) ?? []), r]);
    return [...by.entries()]
      .map(([problem, rs]) => {
        const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
        return { problem, n: rs.length, moved: rs.filter((r) => notes.oneDayMove.includes(r.id)).length, tenants: new Set(rs.map((r) => r.tenant)).size, first: days[0], last: days[days.length - 1] };
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

{#each rows as r (r.problem)}
  {#if r.moved}
    <p class="note">{r.moved} reports read as a one-day move; counted under <code>{r.problem}</code>.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
