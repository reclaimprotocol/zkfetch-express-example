const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = "reclaimprotocol/zk-symmetric-crypto";
const COMMIT_HASH = "f67bb5c35cc821ad1eb3f2ae2c37ace77f57682c";
const TARGET_DIR = path.join(
  process.cwd(),
  "node_modules",
  "@reclaimprotocol",
  "zk-symmetric-crypto",
  "resources"
);
const TEMP_DIR = path.join(process.cwd(), "zk-resources");

/**
 * Perform a HEAD request to fetch the file's content-length.
 * Follows redirects if necessary.
 */
function getFileSize(filePath, url = null) {
  if (!url) {
    url = `https://github.com/${REPO}/raw/${COMMIT_HASH}/resources/${filePath}`;
  }
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      if ([301, 302].includes(res.statusCode) && res.headers.location) {
        return resolve(getFileSize(filePath, res.headers.location));
      }
      const size = parseInt(res.headers['content-length'], 10);
      resolve(isNaN(size) ? 0 : size);
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Download a file from GitHub with retries. On every received chunk,
 * call progressCallback(delta) where delta is the number of bytes just received.
 * Follows redirects if necessary.
 */
async function downloadFile(filePath, targetPath, progressCallback, url = null, retries = 3) {
  if (!url) {
    url = `https://github.com/${REPO}/raw/${COMMIT_HASH}/resources/${filePath}`;
  }
  const dir = path.dirname(targetPath);
  await fs.promises.mkdir(dir, { recursive: true });
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(targetPath);
        const request = https.get(url, (response) => {
          if ([301, 302].includes(response.statusCode) && response.headers.location) {
            // Follow redirect
            return downloadFile(filePath, targetPath, progressCallback, response.headers.location)
              .then(resolve)
              .catch(reject);
          }
          response.on('data', (chunk) => {
            progressCallback(chunk.length);
          });
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        });
    
        request.on('error', (err) => {
          fs.unlink(targetPath, () => reject(err));
        });
    
        request.setTimeout(30000, () => {
          request.destroy();
          reject(new Error(`Timeout downloading ${filePath}`));
        });
      });
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to download ${filePath} after ${retries} attempts: ${error.message}`);
      }
      console.log(`\nRetry ${attempt}/${retries} for ${filePath}: ${error.message}`);
      // Exponential backoff: wait 2^attempt seconds before retrying
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Format bytes into a human–readable string.
 */
function formatBytes(n) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

/**
 * Render the progress string. We compute:
 * - overall progress = globalDownloaded / globalTotal
 * - speed = globalDownloaded / elapsed time
 * - ETA = remaining bytes / speed
 * Also show the number of files finished.
 */
function renderProgress(completedFiles, totalFiles, globalDownloaded, globalTotal, speed, currentFileName) {
  const progress = Math.min(globalTotal > 0 ? globalDownloaded / globalTotal : 0, 1);
  const barLength = 25;
  const filled = Math.round(progress * barLength);
  const unfilled = Math.max(0, barLength - filled);
  const bar = '█'.repeat(filled) + '░'.repeat(unfilled);
  const remaining = speed > 0 ? Math.max(0, globalTotal - globalDownloaded) / speed : 0;
  
  const percentage = (progress * 100).toFixed(1).padStart(5);
  const spdStr = `${formatBytes(speed)}/s`;
  const etaStr = isFinite(remaining) ? `${Math.round(remaining)}s`.padStart(4) : '--';
  
  
  return `[${completedFiles.toString().padStart(2)}/${totalFiles}] ${percentage}% [${bar}] Speed: ${spdStr} Time Left: ${etaStr} | ${currentFileName}`;
}

async function main() {
  try {
    // Ensure the base directory exists.
    const baseDir = path.join(process.cwd(), "node_modules", "@reclaimprotocol", "zk-symmetric-crypto");
    if (!fs.existsSync(baseDir)) {
      throw new Error(
        "Required directory not found: @reclaimprotocol/zk-symmetric-crypto\n" +
        "Please ensure you have installed the package correctly."
      );
    }
  
    // Create and clean temp directory
    await fs.promises.rm(TEMP_DIR, { recursive: true, force: true });
    await fs.promises.mkdir(TEMP_DIR, { recursive: true });
  
    console.log('📦 Downloading ZK files ');
  
    const ciphers = ['chacha20', 'aes-256-ctr', 'aes-128-ctr'];
    const files = ['circuit_final.zkey', 'circuit.wasm', 'circuit.r1cs'];
    const expanderFiles = ['release.wasm', 'chacha20.txt', 'chacha20-solver.txt'];
  
    const allFiles = [
      ...ciphers.flatMap(c => files.map(f => `snarkjs/${c}/${f}`)),
      ...expanderFiles.map(f => `expander/${f}`)
    ];
    const totalFiles = allFiles.length;
  
    // Pre-fetch each file's size so that we can compute overall progress
    console.log('🔍 Fetching file information... please wait');
    let fileSizes = {};
    let globalTotalBytes = 0;
    for (const filePath of allFiles) {
      try {
        const size = await getFileSize(filePath);
        fileSizes[filePath] = size;
        globalTotalBytes += size;
      } catch (err) {
        fileSizes[filePath] = 0;
      }
    }
  
    let completedFiles = 0;
    let globalDownloadedBytes = 0;
    const startTime = Date.now();
  
    process.stdout.write('\x1B[?25l'); // Hide cursor
  
    // Download files sequentially to temp directory
    for (const filePath of allFiles) {
      const targetPath = path.join(TEMP_DIR, filePath);
      let currentFileDownloaded = 0;
  
      await downloadFile(filePath, targetPath, (delta) => {
        currentFileDownloaded += delta;
        globalDownloadedBytes += delta;
  
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? globalDownloadedBytes / elapsed : 0;
  
        const progressStr = renderProgress(
          completedFiles,
          totalFiles,
          globalDownloadedBytes,
          globalTotalBytes,
          speed,
          path.basename(filePath)
        );
        process.stdout.write('\r\x1B[K' + progressStr);
      });
      completedFiles++;
  
      // After finishing the file, update the progress one last time.
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = elapsed > 0 ? globalDownloadedBytes / elapsed : 0;
      const progressStr = renderProgress(
        completedFiles,
        totalFiles,
        globalDownloadedBytes,
        globalTotalBytes,
        speed,
        path.basename(filePath)
      );
      process.stdout.write('\r\x1B[K' + progressStr);
    }
  
    process.stdout.write('\x1B[?25h\n'); // Show cursor
    console.log('\nMoving files to final location...');

    // Move files from temp to final location
    await fs.promises.rm(TARGET_DIR, { recursive: true, force: true });
    await fs.promises.rename(TEMP_DIR, TARGET_DIR);

    console.log('Download completed successfully!');
    process.exit(0);
  } catch (error) {
    process.stdout.write('\x1B[?25h\n'); // Ensure the cursor is restored
    console.error('\nFatal error during download:', error);
    // Clean up temp directory on error
    await fs.promises.rm(TEMP_DIR, { recursive: true, force: true });
    process.exit(1);
  }
}
  
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});
  
main();
