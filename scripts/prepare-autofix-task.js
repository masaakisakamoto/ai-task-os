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
    console.error('Usage: node scripts/prepare-autofix-task.js <draft.json> <autofix-task.json>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const draft = readJson(inputFile);

  const autofixTask = {
    id: `autofix-${draft.source_task_id || draft.id || 'unknown'}`,
    source_run_id: draft.source_run_id || null,
    source_task_id: draft.source_task_id || null,
    goal: draft.goal || 'Apply the minimal fix for failed checks.',
    scope: draft.scope || [
      'inspect failed verification results',
      'apply the minimal fix',
      'preserve existing passing behavior'
    ],
    relevant_failures: draft.proposed_actions || [],
    execution_rules: [
      'make the smallest correct change',
      'do not expand scope',
      'preserve existing passing behavior',
      'no UI',
      'no memory engine',
      'no external API',
      'no unnecessary dependencies'
    ],
    success_definition: [
      'the previously failing condition should pass',
      'existing passing behavior should remain intact'
    ]
  };

  writeJson(outputFile, autofixTask);
  console.log(`✅ Autofix task prepared: ${outputFile}`);
}

main();
