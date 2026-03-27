#!/usr/bin/env node

const fs = require('fs');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function usage() {
  console.error('Usage: node scripts/compare-runs.js <before.json> <after.json> [output.json]');
  process.exit(1);
}

function main() {
  const [, , beforePath, afterPath, outPath] = process.argv;
  if (!beforePath || !afterPath) usage();

  if (!fs.existsSync(beforePath)) {
    console.error(`Before file not found: ${beforePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(afterPath)) {
    console.error(`After file not found: ${afterPath}`);
    process.exit(1);
  }

  const before = readJson(beforePath);
  const after = readJson(afterPath);

  if (!before.eval || !after.eval) {
    console.error('Both artifacts must contain eval');
    process.exit(1);
  }

  const b = before.eval;
  const a = after.eval;

  const delta = (a.ratio ?? 0) - (b.ratio ?? 0);

  let verdict = 'same';
  if (delta > 0) verdict = 'improved';
  if (delta < 0) verdict = 'worse';

  const report = {
    before: {
      run_id: before.run_id || null,
      ratio: b.ratio,
      score: b.score,
      max_score: b.max_score
    },
    after: {
      run_id: after.run_id || null,
      ratio: a.ratio,
      score: a.score,
      max_score: a.max_score
    },
    delta: {
      ratio: delta
    },
    verdict
  };

  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(`✅ Comparison report written: ${outPath}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

main();
