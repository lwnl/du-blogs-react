// utils/tempDir.ts
import fs from 'fs';
import path from 'path';

export const tempDir = path.join(process.cwd(), 'temp-uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}