const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../src/config/loader');

const config = loadConfig();

const reportsDir = config.reportsDir;
const outputDir = path.resolve(__dirname, '../src/public/data');
const outputFile = path.join(outputDir, 'test_results.json');

// Regex to identify our BDD Labels from config
const labelRegex = config.tagPattern;

function findReportFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // Ignore node_modules, .git, etc.
    if (['node_modules', '.git', 'deploy', 'docs-app'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findReportFiles(fullPath, fileList);
    } else if (file.endsWith('_report.json')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function parseReports() {
  const reportFiles = findReportFiles(reportsDir);
  const results = {};

  for (const file of reportFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const data = JSON.parse(content);
      
      // Each report file is an array of Suite results
      if (!Array.isArray(data)) continue;

      for (const suite of data) {
        if (!suite.SpecReports) continue;

        for (const spec of suite.SpecReports) {
          // Look for matching tags in both Container and Leaf labels
          const labels = [];
          if (spec.ContainerHierarchyLabels) {
            for (const layer of spec.ContainerHierarchyLabels) {
              if (Array.isArray(layer)) {
                labels.push(...layer);
              }
            }
          }
          if (Array.isArray(spec.LeafNodeLabels)) {
            labels.push(...spec.LeafNodeLabels);
          }

          // Find the BDD ID
          const bddId = labels.find(l => labelRegex.test(l));
          if (bddId) {
            // Aggregate State: if it fails once, it's failed.
            const existing = results[bddId];
            if (!existing || existing.state === 'passed') { // If new or previous was passed, overwrite
              let relativeLocation = null;
              if (spec.LeafNodeLocation && spec.LeafNodeLocation.FileName) {
                // Find matching module dir to make relative path
                let relFileName = spec.LeafNodeLocation.FileName;
                for (const mDir of config.modulesDir) {
                  if (spec.LeafNodeLocation.FileName.startsWith(mDir)) {
                    relFileName = path.relative(mDir, spec.LeafNodeLocation.FileName);
                    break;
                  }
                }
                relativeLocation = {
                  FileName: relFileName,
                  LineNumber: spec.LeafNodeLocation.LineNumber
                };
              }
              
              results[bddId] = {
                state: spec.State,
                runtime: spec.RunTime, // nanoseconds
                location: relativeLocation,
                failure: spec.Failure ? {
                  message: spec.Failure.Message,
                  location: spec.Failure.Location ? spec.Failure.Location.FileName + ':' + spec.Failure.Location.LineNumber : null
                } : null,
                startTime: spec.StartTime
              };
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[Gorkin] Aggregated test reports into src/public/data/test_results.json. Found ${Object.keys(results).length} labels.`);
}

parseReports();
