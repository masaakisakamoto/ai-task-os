#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function resolveArtifactPath(inputPath) {
  return path.resolve(process.cwd(), inputPath);
}

function loadJson(filePath) {
  const resolved = resolveArtifactPath(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Could not load file: ${filePath}`);
  }

  const raw = fs.readFileSync(resolved, "utf8");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in file: ${filePath}`);
  }
}

function isResolvableJsonPath(filePath) {
  try {
    loadJson(filePath);
    return true;
  } catch {
    return false;
  }
}

function resultOk(artifactPath, kind, checkedRules) {
  return {
    ok: true,
    artifact_path: artifactPath,
    kind,
    checked_rules: checkedRules
  };
}

function resultFail(artifactPath, kind, checkedRules, errors) {
  return {
    ok: false,
    artifact_path: artifactPath,
    kind,
    checked_rules: checkedRules,
    errors
  };
}

function checkComparisonReportInvariant(doc) {
  const checkedRules = ["CR-1", "CR-2", "CR-3"];
  const errors = [];

  if (doc.before_run_path === doc.after_run_path) {
    errors.push({
      rule: "CR-1",
      message: "before_run_path and after_run_path must not be equal"
    });
  }

  if (!isResolvableJsonPath(doc.before_run_path)) {
    errors.push({
      rule: "CR-2",
      message: "before_run_path must be a resolvable JSON artifact path"
    });
  }

  if (!isResolvableJsonPath(doc.after_run_path)) {
    errors.push({
      rule: "CR-3",
      message: "after_run_path must be a resolvable JSON artifact path"
    });
  }

  return { checkedRules, errors };
}

function checkComparisonDecisionInvariant(doc) {
  const checkedRules = ["CD-1", "CD-2", "CD-3"];
  const errors = [];

  let report;

  try {
    report = loadJson(doc.based_on_comparison_report_path);
  } catch {
    errors.push({
      rule: "CD-1",
      message: "based_on_comparison_report_path could not be loaded"
    });
    return { checkedRules, errors };
  }

  if (report.kind !== "comparison_report") {
    errors.push({
      rule: "CD-2",
      message: "referenced artifact kind must be comparison_report"
    });
    return { checkedRules, errors };
  }

  const matchesBefore = doc.source_run_path === report.before_run_path;
  const matchesAfter = doc.source_run_path === report.after_run_path;

  if (!matchesBefore && !matchesAfter) {
    errors.push({
      rule: "CD-3",
      message:
        "source_run_path must match before_run_path or after_run_path in the referenced comparison report"
    });
  }

  return { checkedRules, errors };
}

function checkRetryInputInvariant(doc) {
  const checkedRules = ["RI-1", "RI-2", "RI-3"];
  const errors = [];

  let decision;

  try {
    decision = loadJson(doc.comparison_decision_path);
  } catch {
    errors.push({
      rule: "RI-1",
      message: "comparison_decision_path could not be loaded"
    });
    return { checkedRules, errors };
  }

  if (decision.kind !== "comparison_decision") {
    errors.push({
      rule: "RI-2",
      message: "referenced artifact kind must be comparison_decision"
    });
    return { checkedRules, errors };
  }

  if (doc.source_run_path !== decision.source_run_path) {
    errors.push({
      rule: "RI-3",
      message:
        "source_run_path must match source_run_path in the referenced comparison decision"
    });
  }

  return { checkedRules, errors };
}

function main() {
  const artifactPath = process.argv[2];

  if (!artifactPath) {
    console.log(JSON.stringify({ ok: false, error: "Missing argument" }, null, 2));
    process.exit(2);
  }

  let doc;
  try {
    doc = loadJson(artifactPath);
  } catch (error) {
    console.log(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exit(2);
  }

  let result;

  switch (doc.kind) {
    case "comparison_report":
      result = checkComparisonReportInvariant(doc);
      break;
    case "comparison_decision":
      result = checkComparisonDecisionInvariant(doc);
      break;
    case "retry_input":
      result = checkRetryInputInvariant(doc);
      break;
    default:
      console.log(JSON.stringify({ ok: false, error: `Unsupported kind: ${doc.kind}` }, null, 2));
      process.exit(2);
  }

  if (result.errors.length > 0) {
    console.log(JSON.stringify(resultFail(artifactPath, doc.kind, result.checkedRules, result.errors), null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(resultOk(artifactPath, doc.kind, result.checkedRules), null, 2));
  process.exit(0);
}

main();
