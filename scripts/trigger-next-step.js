#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
  const sourceRunPath = decision.source_run_path;

  console.log(`Detected action: ${action}`);

  if (action === 'retry_improvement') {
    console.log('→ Triggering new improvement task generation');

    if (!sourceRunPath || !fs.existsSync(sourceRunPath)) {
      console.error(`Invalid source_run_path: ${sourceRunPath}`);
      process.exit(1);
    }

    try {
      execSync(
        `node scripts/generate-improvement-task.js ${JSON.stringify(sourceRunPath)} /tmp/generated-improvement-task.json`,
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
