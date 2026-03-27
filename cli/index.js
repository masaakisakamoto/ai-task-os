#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function validateTaskShape(task) {
  const required = ['id', 'type', 'objective', 'input'];
  const missing = required.filter((key) => !(key in task));
  return {
    ok: missing.length === 0,
    missing
  };
}

function buildRun(task) {
  const now = new Date().toISOString();

  return {
    run_id: `run-${Date.now()}`,
    task_id: task.id || 'unknown-task',
    timestamp: now,
    input_snapshot: task,
    output: {
      result: 'stub',
      summary: 'Minimal runner executed successfully'
    },
    status: 'success',
    trace: [
      'Loaded task JSON',
      'Validated minimal task shape',
      'Built minimal run artifact',
      'Wrote run.json'
    ]
  };
}

function printHelp() {
  console.log(`
AI Task OS CLI

Usage:
  node cli/index.js run <task.json>
  ai-task run <task.json>

Example:
  node cli/index.js run examples/pr-review.json
`);
}

function main() {
  const [, , command, inputFile] = process.argv;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command !== 'run' || !inputFile) {
    printHelp();
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const task = readJson(inputPath);
  const validation = validateTaskShape(task);

  if (!validation.ok) {
    console.error(`Invalid task JSON. Missing keys: ${validation.missing.join(', ')}`);
    process.exit(1);
  }

  const run = buildRun(task);

  const outDir = path.resolve(process.cwd(), 'artifacts');
  ensureDir(outDir);

  const outPath = path.join(outDir, 'run.json');
  writeJson(outPath, run);

  console.log(`✅ Run generated: ${outPath}`);
}

main();
