const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig } = require('../src/config/loader');

const config = loadConfig();
const reportsDir = config.reportsDir;

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Parse arguments
const args = process.argv.slice(2);
let tagFilter = '';
if (args.includes('--tag')) {
  const index = args.indexOf('--tag');
  tagFilter = args[index + 1];
}

// Find all directories containing a go.mod file
function findGoModules(dir, modules = [], depth = 0) {
  if (depth > 3) return modules; // Prevent overly deep recursion
  if (!fs.existsSync(dir)) return modules;
  
  const files = fs.readdirSync(dir);
  
  // If this directory has a go.mod, record it.
  // Note: we don't return here because there could be nested modules like games/slot001
  if (files.includes('go.mod')) {
    modules.push(dir);
  }

  for (const file of files) {
    // Ignore cache, vendor, deployment, and git dirs
    if (['node_modules', '.git', 'deploy', 'mod', 'vendor', '.gemini', '.vitepress'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findGoModules(fullPath, modules, depth + 1);
    }
  }
  return modules;
}

// Find across all configured module directories
const modules = [];
for (const mDir of config.modulesDir) {
  findGoModules(mDir, modules);
}
console.log(`[Gorkin] Found Go modules in: ${modules.join(', ')}`);

const ginkgoCmd = 'go run github.com/onsi/ginkgo/v2/ginkgo';
const filterArg = tagFilter ? `--label-filter="${tagFilter}"` : '';

for (const modPath of modules) {
  // Use a hash of the absolute path to ensure uniqueness if outside project, 
  // or a relative path from the config.modulesDir. We'll just replace slashes.
  const modName = modPath.replace(/[/\\]/g, '_').replace(/^_+/, '');
  const reportPath = path.join(reportsDir, `${modName}_report.json`);
  const relativeReportPath = path.relative(modPath, reportPath);
  
  const cmd = `${ginkgoCmd} ${filterArg} --json-report="${relativeReportPath}" -skip-package=mod ./...`;
  console.log(`[Gorkin] Running in ${modName}: ${cmd}`);
  
  try {
    // Execute synchronously to avoid log interleaving and ensure ordered execution
    execSync(cmd, { cwd: modPath, stdio: 'inherit' });
  } catch (error) {
    // Ginkgo returns non-zero if tests fail, we catch it so we don't crash the script 
    // and can proceed to the next module.
    console.error(`[Gorkin] Tests failed in module ${modName}.`);
  }
}

console.log('[Gorkin] Aggregating JSON reports...');
require('./aggregate_reports.js');
console.log('[Gorkin] Dynamic Test Run Complete!');
