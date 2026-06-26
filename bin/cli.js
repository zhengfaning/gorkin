#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const initCommand = require('../src/cli/init');

const args = process.argv.slice(2);
const command = args[0];

// The directory where gorkin is installed (tool root)
const toolRoot = path.resolve(__dirname, '..');

// Inject the user's current working directory into the environment.
// This allows loader.js to find the config file even when this CLI is run globally or from node_modules.
process.env.GORKIN_USER_DIR = process.cwd();

// Function to run preflight check and tests
function runPreflightAndTests() {
  console.log('[Gorkin] Running preflight check and aggregating test reports...');
  try {
    execSync('node scripts/preflight_check.js', { cwd: toolRoot, stdio: 'inherit' });
    execSync('node scripts/aggregate_reports.js', { cwd: toolRoot, stdio: 'inherit' });
  } catch (err) {
    console.error('❌ [Gorkin Error] Setup failed.');
    process.exit(1);
  }
}

// Ensure commands run from within the tool's root to correctly resolve vitepress
function runVitepress(cmdArgs) {
  runPreflightAndTests();
  try {
    execSync(`npx vitepress ${cmdArgs}`, { cwd: toolRoot, stdio: 'inherit' });
  } catch (err) {
    process.exit(1);
  }
}

switch (command) {
  case 'init':
    initCommand();
    break;

  case 'dev':
    runVitepress('dev');
    break;

  case 'build':
    runVitepress('build');
    break;

  case 'serve':
    runVitepress('serve');
    break;

  case 'test':
    console.log('[Gorkin] Running dynamic test suite...');
    try {
      execSync(`node scripts/run_dynamic_tests.js ${args.slice(1).join(' ')}`, { cwd: toolRoot, stdio: 'inherit' });
    } catch (err) {
      process.exit(1);
    }
    break;

  default:
    console.log(`
Gorkin: The Modern Living Documentation Generator for Go

Usage:
  gorkin init       # Scaffold a new gorkin environment in the current directory
  gorkin dev        # Start the local development server (with live-reloading)
  gorkin build      # Build the static site for production deployment
  gorkin serve      # Preview the built static site
  gorkin test       # Run all dynamic tests across configured Go modules
`);
    process.exit(1);
}
