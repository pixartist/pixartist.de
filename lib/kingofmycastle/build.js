const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, './dist');
const packageJsonPath = path.resolve(__dirname, './package.json');

function generateExportsMap(dir, baseDir = dir, map = {}) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.resolve(dir, item.name);
    const relativePath = path.relative(baseDir, itemPath);
    if (item.isDirectory()) {
      generateExportsMap(itemPath, baseDir, map);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      // Create a key for the export map, excluding the .js extension
      const key = `./${relativePath.replace(/\.js$/, '')}`;
      const value = `./${path.join('dist', relativePath)}`;
      map[key.replace(/\\/g, '/')] = value.replace(/\\/g, '/');
    }
  }
  return map;
}

const exportsMap = generateExportsMap(distDir);

// Read existing package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update exports field
packageJson.exports = exportsMap;

// Write updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('Exports map updated.');
