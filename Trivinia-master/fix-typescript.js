const fs = require('fs');
const path = require('path');

// Path to the problematic tsconfig.json
const tsconfigPath = path.join(__dirname, 'node_modules', 'connect-mongo', 'tsconfig.json');

// Check if the file exists
if (fs.existsSync(tsconfigPath)) {
  try {
    // Read the current tsconfig.json
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Add skipLibCheck to avoid type checking in node_modules
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    tsconfig.compilerOptions.skipLibCheck = true;
    
    // Write the updated tsconfig.json
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    
    console.log('Successfully fixed connect-mongo tsconfig.json');
  } catch (error) {
    console.error('Error fixing tsconfig.json:', error);
  }
} else {
  console.log('connect-mongo tsconfig.json not found');
} 