#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function getJsonPath(obj, pathStr) {
  return pathStr.split('.').reduce((acc, key) => acc && acc[key], obj);
}

function runCommandCheck(check) {
  try {
    const output = execSync(check.run, { encoding: 'utf8', stdio: 'pipe' }).trim();
    return {
      kind: 'check',
      type: check.type,
      ok: true,
      output
    };
  } catch (error) {
    return {
      kind: 'check',
      type: check.type,
      ok: false,
      error: error.message
    };
  }
}

function runFileExistsCheck(check) {
  const ok = fs.existsSync(check.path);
  return {
    kind: 'check',
    type: check.type,
    ok,
    error: ok ? null : `File not found: ${check.path}`
  };
}

function runJsonPathCheck(check) {
  try {
    const data = readJson(check.file);
    const value = getJsonPath(data, check.path);

    const ok = value === check.equals;

    return {
      kind: 'check',
      type: check.type,
      ok,
      actual: value,
      expected: check.equals,
      error: ok ? null : `Expected ${check.equals}, got ${value}`
    };
  } catch (error) {
    return {
      kind: 'check',
      type: check.type,
      ok: false,
      error: error.message
    };
  }
}

function runChecks(checks) {
  return checks.map(check => {
    if (check.type === 'command') return runCommandCheck(check);
    if (check.type === 'file_exists') return runFileExistsCheck(check);
    if (check.type === 'json_path_equals') return runJsonPathCheck(check);

    return {
      kind: 'check',
      type: check.type,
      ok: false,
      error: 'Unsupported check type'
    };
  });
}

function buildSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.ok).length;
  return {
    total,
    passed,
    failed: total - passed,
    all_passed: passed === total
  };
}

function buildEval(summary) {
  const ratio = summary.total === 0 ? 1.0 : summary.passed / summary.total;
  return {
    score: summary.passed,
    max_score: summary.total,
    ratio,
    label: summary.all_passed ? 'pass' : 'fail'
  };
}

function main() {
  const [, , command, file] = process.argv;

  if (command !== 'run' || !file) {
    console.log('Usage: node cli/index.js run <task.json>');
    process.exit(1);
  }

  const task = readJson(file);
  const results = runChecks(task.checks || []);
  const summary = buildSummary(results);

  const run = {
    run_id: `run-${Date.now()}`,
    task_id: task.id,
    timestamp: new Date().toISOString(),
    task_snapshot: task,
    output: {
      result: summary.all_passed ? 'pass' : 'fail',
      summary: `${summary.passed}/${summary.total} checks passed`
    },
    trace: [
      'Loaded task JSON',
      'Ran checks',
      `Result: ${summary.passed}/${summary.total} passed`
    ],
    eval: buildEval(summary),
    verify_summary: summary,
    verify_results: results,
    status: summary.all_passed ? 'success' : 'failed'
  };

  ensureDir('artifacts');
  const out = `artifacts/${task.id}-run.json`;
  writeJson(out, run);

  console.log(`✅ Run generated: ${out}`);

  if (!summary.all_passed) process.exit(1);
}

main();
