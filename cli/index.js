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

function validateTask(task) {
  const hasLegacyFields =
    'goal' in task &&
    'scope' in task &&
    'success_criteria' in task;

  const hasChecksFields =
    'goal' in task &&
    'scope' in task &&
    Array.isArray(task.checks);

  if (hasLegacyFields || hasChecksFields) {
    return { ok: true, missing: [] };
  }

  const required = ['id', 'goal', 'scope'];
  const missing = required.filter((key) => !(key in task));

  if (!('success_criteria' in task) && !('checks' in task)) {
    missing.push('success_criteria|checks');
  }

  return {
    ok: false,
    missing
  };
}

function runVerifyCommands(commands) {
  const results = [];

  for (const command of commands || []) {
    try {
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      results.push({
        kind: 'legacy_command',
        command,
        ok: true,
        output: output.trim()
      });
    } catch (error) {
      results.push({
        kind: 'legacy_command',
        command,
        ok: false,
        output: error.stdout ? String(error.stdout).trim() : '',
        error: error.stderr ? String(error.stderr).trim() : error.message
      });
    }
  }

  return results;
}

function evaluateCommandExpectation(expect, output) {
  if (expect === 'exit_code_0' || expect == null) {
    return { ok: true };
  }

  if (typeof expect === 'object' && typeof expect.stdout_contains === 'string') {
    const ok = output.includes(expect.stdout_contains);
    return {
      ok,
      reason: ok
        ? null
        : `stdout did not include expected text: ${expect.stdout_contains}`
    };
  }

  return {
    ok: false,
    reason: 'Unsupported expect format'
  };
}

function runChecks(checks) {
  const results = [];

  for (const check of checks || []) {
    if (check.type !== 'command') {
      results.push({
        kind: 'check',
        type: check.type || 'unknown',
        ok: false,
        error: 'Unsupported check type'
      });
      continue;
    }

    try {
      const output = execSync(check.run, { encoding: 'utf8', stdio: 'pipe' }).trim();
      const evaluation = evaluateCommandExpectation(check.expect, output);

      results.push({
        kind: 'check',
        type: check.type,
        run: check.run,
        expect: check.expect || null,
        ok: evaluation.ok,
        output,
        error: evaluation.reason || null
      });
    } catch (error) {
      results.push({
        kind: 'check',
        type: check.type,
        run: check.run,
        expect: check.expect || null,
        ok: false,
        output: error.stdout ? String(error.stdout).trim() : '',
        error: error.stderr ? String(error.stderr).trim() : error.message
      });
    }
  }

  return results;
}

function buildVerifySummary(results) {
  const total = results.length;
  const passed = results.filter((result) => result.ok).length;
  const failed = total - passed;

  return {
    total,
    passed,
    failed,
    all_passed: failed === 0
  };
}

function buildRun(task, verificationResults) {
  const now = new Date().toISOString();
  const verifySummary = buildVerifySummary(verificationResults);

  return {
    run_id: `run-${Date.now()}`,
    task_id: task.id,
    timestamp: now,
    task_snapshot: task,
    output: {
      result: verifySummary.all_passed ? 'verified' : 'verification_failed',
      summary: verifySummary.all_passed
        ? 'Task executed and all verification passed'
        : 'Task executed but one or more checks failed'
    },
    status: verifySummary.all_passed ? 'success' : 'failed',
    verify_summary: verifySummary,
    verify_results: verificationResults,
    trace: [
      'Loaded task JSON',
      'Validated task structure',
      'Executed verification',
      'Built verify_summary',
      'Built run artifact'
    ]
  };
}

function collectVerificationResults(task) {
  if (Array.isArray(task.checks)) {
    return runChecks(task.checks);
  }

  return runVerifyCommands(task.verify_commands || []);
}

function printHelp() {
  console.log(`
AI Task OS CLI

Usage:
  node cli/index.js run <task.json>

Examples:
  node cli/index.js run tasks/003-help-command.json
  node cli/index.js run tasks/005-help-command-checks.json
`);
}

function main() {
  const [, , command, inputFile] = process.argv;

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    process.exit(0);
  }

  if (command !== 'run' || !inputFile) {
    printHelp();
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const task = readJson(inputPath);
  const validation = validateTask(task);

  if (!validation.ok) {
    console.error(`Invalid task. Missing: ${validation.missing.join(', ')}`);
    process.exit(1);
  }

  const verificationResults = collectVerificationResults(task);
  const run = buildRun(task, verificationResults);

  const outDir = path.resolve(process.cwd(), 'artifacts');
  ensureDir(outDir);

  const outPath = path.join(outDir, `${task.id}-run.json`);
  writeJson(outPath, run);

  console.log(`✅ Run generated: ${outPath}`);

  if (run.status !== 'success') {
    process.exit(1);
  }
}

main();
