const fs = require('fs');
const path = require('path');

// Path to the problematic tsconfig.json
const tsconfigPath = path.join(__dirname, 'node_modules', 'connect-mongo', 'tsconfig.json');

// Create a simple tsconfig.json file
const simpleTsconfig = {
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": true
  }
};

// Write the simple tsconfig.json
try {
  fs.writeFileSync(tsconfigPath, JSON.stringify(simpleTsconfig, null, 2));
  console.log('Successfully fixed connect-mongo tsconfig.json');
} catch (error) {
  console.error('Error fixing tsconfig.json:', error);
} 