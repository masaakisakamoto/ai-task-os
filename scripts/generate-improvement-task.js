#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function main() {
  const [, , inputFile, outputFile] = process.argv;

  if (!inputFile || !outputFile) {
    console.error('Usage: node scripts/generate-improvement-task.js <failed-run.json> <output.json>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const run = readJson(inputFile);

  if (run.status !== 'failed') {
    console.error('Input run artifact must have status="failed"');
    process.exit(1);
  }

  const failedResults = (run.verify_results || []).filter((result) => !result.ok);

  const improvementTask = {
    id: `improve-${run.task_id || 'unknown-task'}`,
    source_run_id: run.run_id || null,
    source_task_id: run.task_id || null,
    goal: 'Investigate and improve failed verification results.',
    scope: [
      'inspect failed verification results',
      'identify the minimal change required',
      'preserve existing passing behavior'
    ],
    proposed_actions: failedResults.map((result, index) => ({
      step: index + 1,
      check_type: result.type || result.kind || 'unknown',
      target:
        result.path ||
        result.run ||
        result.command ||
        null,
      error: result.error || 'Unknown failure'
    }))
  };

  writeJson(outputFile, improvementTask);
  console.log(`✅ Improvement task generated: ${outputFile}`);
}

main();
