import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, "..", "public", "ExploreImages");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png"]);

async function convertAndDelete() {
    const files = await fs.promises.readdir(imagesDir);

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!allowedExtensions.has(ext)) continue;

        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(
            imagesDir,
            `${path.parse(file).name}.webp`
        );

        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);

            // Delete original AFTER successful conversion
            await fs.promises.unlink(inputPath);

            console.log(`✅ ${file} → ${path.basename(outputPath)} (original deleted)`);
        } catch (err) {
            console.error(`❌ Failed to convert ${file}`, err);
        }
    }

    console.log("🎉 Conversion completed successfully");
}

convertAndDelete();
