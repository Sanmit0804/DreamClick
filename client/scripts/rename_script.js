import fs from 'fs/promises'; // Use fs/promises for async operations
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '..', '..', 'client', 'public', 'ExploreImages');

async function renameFiles() {
    try {
        const files = await fs.readdir(dir);
        // Filter images
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext) && file !== 'vite.svg';
        });

        // 1. Rename to temp
        const tempMap = [];
        for (const file of imageFiles) {
            const ext = path.extname(file);
            const tempName = `temp_${Math.random().toString(36).substring(7)}${ext}`;
            await fs.rename(path.join(dir, file), path.join(dir, tempName));
            tempMap.push({ temp: tempName, ext: ext });
        }

        // 2. Rename to 1..N
        let i = 1;
        for (const item of tempMap) {
            const newName = `${i}${item.ext}`;
            await fs.rename(path.join(dir, item.temp), path.join(dir, newName));
            console.log(`Renamed to ${newName}`);
            i++;
        }
    } catch (e) {
        console.error(e);
    }
}

renameFiles();
