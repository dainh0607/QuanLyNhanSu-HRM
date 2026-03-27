const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const destDir = path.join(srcDir, 'features', 'employees', 'components');

// Create destination dir
fs.mkdirSync(destDir, { recursive: true });

// Files to move
const files = [
  'ActionAndFilterBar.tsx',
  'ColumnConfigSidebar.tsx',
  'DataTable.tsx',
  'EmployeeList.tsx',
  'FilterSidebar.tsx',
  'PageToolbar.tsx',
  'Pagination.tsx'
];

files.forEach(file => {
  const oldPath = path.join(componentsDir, file);
  const newPath = path.join(destDir, file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Moved', file);
  } else {
    console.log('Not found', file);
  }
});

// Delete mock data
const mockDataPath = path.join(srcDir, 'data', 'MockDataNhanSu.ts');
if (fs.existsSync(mockDataPath)) {
  fs.unlinkSync(mockDataPath);
  console.log('Deleted MockDataNhanSu.ts');
}

console.log('Done');
