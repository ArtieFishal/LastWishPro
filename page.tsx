export default function Page() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Plan your digital legacy</h2>
        <p>Create beneficiary assignments for tokens and NFTs, then generate printable documents.</p>
        <div className="flex gap-3">
          <a className="px-4 py-2 rounded-xl border" href="/onboarding">Start</a>
          <a className="px-4 py-2 rounded-xl border" href="/docs">Docs</a>
        </div>
      </div>
      <div className="rounded-2xl border p-4">
        <ol className="list-decimal pl-6 space-y-1">
          <li>Owner info</li>
          <li>Connect wallet</li>
          <li>Load assets</li>
          <li>Add beneficiaries</li>
          <li>Assign percentages</li>
          <li>Pay and generate</li>
        </ol>
      </div>
    </section>
  );
}

