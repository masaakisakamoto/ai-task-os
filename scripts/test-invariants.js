#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const FIXTURES_ROOT = path.join(ROOT, "fixtures", "invariants");
const CHECKER_PATH = path.join(ROOT, "scripts", "check-invariants.js");

function walkJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".json")) continue;
    if (!(entry.name.endsWith(".pass.json") || entry.name.endsWith(".fail.json"))) continue;

    results.push(fullPath);
  }

  return results.sort();
}

function toRelative(p) {
  return path.relative(ROOT, p);
}

function expectedExitCode(filePath) {
  const base = path.basename(filePath);

  if (base.endsWith(".pass.json")) return 0;
  if (base.endsWith(".fail.json")) return 1;

  throw new Error(`Unsupported fixture naming: ${filePath}`);
}

function expectedOk(filePath) {
  const base = path.basename(filePath);

  if (base.endsWith(".pass.json")) return true;
  if (base.endsWith(".fail.json")) return false;

  throw new Error(`Unsupported fixture naming: ${filePath}`);
}

function runChecker(fixturePath) {
  const relFixturePath = toRelative(fixturePath);

  const result = spawnSync("node", [CHECKER_PATH, relFixturePath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  return {
    fixturePath: relFixturePath,
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseJsonOutput(stdout, fixturePath) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Invalid JSON output from checker for fixture: ${fixturePath}`);
  }
}

function evaluateFixture(fixturePath) {
  const expectedCode = expectedExitCode(fixturePath);
  const expectedOkValue = expectedOk(fixturePath);

  const run = runChecker(fixturePath);

  if (run.exitCode === null) {
    return {
      ok: false,
      fixturePath: run.fixturePath,
      message: "checker did not return an exit code"
    };
  }

  let parsed;
  try {
    parsed = parseJsonOutput(run.stdout, run.fixturePath);
  } catch (error) {
    return {
      ok: false,
      fixturePath: run.fixturePath,
      message: error.message,
      details: {
        exitCode: run.exitCode,
        stdout: run.stdout,
        stderr: run.stderr
      }
    };
  }

  const problems = [];

  if (run.exitCode !== expectedCode) {
    problems.push(
      `expected exit code ${expectedCode}, got ${run.exitCode}`
    );
  }

  if (parsed.ok !== expectedOkValue) {
    problems.push(
      `expected output ok=${expectedOkValue}, got ok=${parsed.ok}`
    );
  }

  if (problems.length > 0) {
    return {
      ok: false,
      fixturePath: run.fixturePath,
      message: problems.join("; "),
      details: {
        exitCode: run.exitCode,
        stdout: parsed,
        stderr: run.stderr
      }
    };
  }

  return {
    ok: true,
    fixturePath: run.fixturePath
  };
}

function main() {
  if (!fs.existsSync(CHECKER_PATH)) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: `Missing checker script: ${toRelative(CHECKER_PATH)}`
        },
        null,
        2
      )
    );
    process.exit(2);
  }

  if (!fs.existsSync(FIXTURES_ROOT)) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: `Missing fixtures directory: ${toRelative(FIXTURES_ROOT)}`
        },
        null,
        2
      )
    );
    process.exit(2);
  }

  const fixtures = walkJsonFiles(FIXTURES_ROOT);

  if (fixtures.length === 0) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: `No invariant fixtures found under: ${toRelative(FIXTURES_ROOT)}`
        },
        null,
        2
      )
    );
    process.exit(2);
  }

  const results = fixtures.map(evaluateFixture);
  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  for (const result of passed) {
    console.log(`PASS ${result.fixturePath}`);
  }

  for (const result of failed) {
    console.log(`FAIL ${result.fixturePath}`);
    console.log(`  ${result.message}`);

    if (result.details) {
      console.log(
        `  details: ${JSON.stringify(result.details, null, 2)
          .split("\n")
          .join("\n  ")}`
      );
    }
  }

  console.log("");
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);

  process.exit(failed.length === 0 ? 0 : 1);
}

main();
