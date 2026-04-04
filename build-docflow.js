const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'docflow');
const src = path.join(root, 'src');

if (!fs.existsSync(root)) {
  fs.mkdirSync(root, { recursive: true });
}

const files = {
  // A - Setup is mostly skipped in Node, we will just create the structure and do package.json later
  "package.json": JSON.stringify({
    "name": "docflow",
    "version": "1.0.0",
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "next": "15.0.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }, null, 2),
  "src/lib/env.ts": `import { z } from 'zod';\nexport const env = {};`,
  "prisma/schema.prisma": `generator client {\n  provider = "prisma-client-js"\n}\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}`,
};

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log("Built basic scaffold. Node script simulation complete.");
