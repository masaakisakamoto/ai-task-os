# Task Input Template

## Task name
add CLI help command polish

## Goal
Make the CLI help output clearer and more reusable.

## Scope
- improve current help output in cli/index.js
- make usage text cleaner
- keep current run behavior unchanged

## Non-scope
- no new commands
- no dependency changes
- no schema redesign

## Success criteria
- node cli/index.js --help prints clear help
- run command still works
- no other behavior changes

## Relevant files
- cli/index.js

## Constraints
- keep minimal
- do not change architecture unless necessary
- no UI
- no memory engine
- no unnecessary dependencies
