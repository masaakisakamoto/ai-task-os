#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const [, , decisionFile] = process.argv;

  if (!decisionFile) {
    console.error('Usage: node scripts/trigger-next-step.js <decision.json>');
    process.exit(1);
  }

  if (!fs.existsSync(decisionFile)) {
    console.error(`Decision file not found: ${decisionFile}`);
    process.exit(1);
  }

  const decision = readJson(decisionFile);
  const action = decision.next_action?.action;

  console.log(`Detected action: ${action}`);

  if (action === 'retry_improvement') {
    console.log('→ Triggering new improvement task generation');

    try {
      execSync(
        'node scripts/generate-improvement-task.js artifacts/tmp-fail-test-run.json /tmp/generated-improvement-task.json',
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.error('Failed to generate improvement task');
      process.exit(1);
    }

    console.log('✅ New improvement task generated');
  } else {
    console.log('→ No retry needed');
  }
}

main();
