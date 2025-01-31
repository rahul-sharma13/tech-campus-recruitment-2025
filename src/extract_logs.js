const fs = require('fs');
const { Worker } = require('worker_threads');
const path = require('path');

/**
 * Extract logs in parallel using worker threads
 * @param {string} logFile - Path to the log file
 * @param {string} targetDate - Date to filter logs
 * @param {string} outputDir - Directory to save output file (default: 'output')
 * @param {number} workers - Number of worker threads to use (default: 4)
 */
function extractLogsConcurrently(logFile, targetDate, outputDir = 'output', workers = 4) {
    if (!fs.existsSync(logFile)) {
        console.error(`Error: Log file '${logFile}' not found.`);
        process.exit(1);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `output_${targetDate}.txt`);
    const stats = fs.statSync(logFile);
    const fileSize = stats.size;
    const chunkSize = Math.ceil(fileSize / workers);

    let completedWorkers = 0;
    let results = [];

    for (let i = 0; i < workers; i++) {
        const start = i * chunkSize;
        const end = (i + 1) * chunkSize - 1;

        // Create a worker thread for parallel log processing
        const worker = new Worker('./src/logProcessor.js', {
            workerData: { logFile, targetDate, start, end }
        });

        // Collect processed log data from worker
        worker.on('message', (data) => {
            results.push(data);
            completedWorkers++;

            // Write results to file once all workers are done
            if (completedWorkers === workers) {
                fs.writeFileSync(outputFile, results.join(''), 'utf-8');
                console.log(`Logs for ${targetDate} extracted successfully to ${outputFile}`);
            }
        });

        // Handle worker errors
        worker.on('error', (err) => console.error('Worker Error:', err));
    }
}

// Get command-line arguments
const logFilePath = process.argv[2];
const dateToExtract = process.argv[3];
extractLogsConcurrently(logFilePath, dateToExtract);
