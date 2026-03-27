#!/usr/bin/env node

const fs = require('fs');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function main() {
  const [, , inputFile, outputFile] = process.argv;

  if (!inputFile || !outputFile) {
    console.error('Usage: node scripts/decide-from-comparison.js <compare-report.json> <decision.json>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const report = readJson(inputFile);
  const verdict = report.verdict;

  let action = 'retry_improvement';
  let reason = 'Comparison verdict was not recognized clearly.';

  if (verdict === 'improved') {
    action = 'accept_improvement';
    reason = 'After run improved over before run.';
  } else if (verdict === 'same') {
    action = 'retry_improvement';
    reason = 'No measurable improvement detected.';
  } else if (verdict === 'worse') {
    action = 'rollback_candidate';
    reason = 'After run performed worse than before run.';
  }

  const sourceRunPath = report.after?.path || null;

  const decision = {
    source_verdict: verdict,
    source_run_path: sourceRunPath,
    before: report.before || null,
    after: report.after || null,
    delta: report.delta || null,
    next_action: {
      action,
      reason
    }
  };

  writeJson(outputFile, decision);
  console.log(`✅ Decision written: ${outputFile}`);
}

main();
