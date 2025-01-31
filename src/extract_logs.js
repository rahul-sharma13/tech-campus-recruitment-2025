/*
// Required Node.js modules
const fs = require('fs');
const path = require('path');

// Main function to extract logs for a specific date
function extractLogs(logFile, targetDate, outputDir = 'output') {
    // Check if the log file exists
    if (!fs.existsSync(logFile)) {
        console.error(`Error: Log file '${logFile}' not found.`);
        process.exit(1); // Exit the process if the file isn't found
    }

    // Ensure the output directory exists (create if not)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Define the output file path
    const outputFile = path.join(outputDir, `output_${targetDate}.txt`);
    // Create read and write streams for handling large files efficiently
    const readStream = fs.createReadStream(logFile, { encoding: 'utf-8' });
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf-8' });

    let buffer = ''; // Buffer to store incomplete lines between chunks

    // Read the log file in chunks
    readStream.on('data', (chunk) => {
        buffer += chunk; // Add the chunk to the buffer
        let lines = buffer.split('\n'); // Split buffer into lines
        buffer = lines.pop(); // Preserve any incomplete line at the end

        // Process each complete line
        lines.forEach(line => {
            if (line.startsWith(targetDate)) { // Check if line matches target date
                writeStream.write(line + '\n'); // Write matching line to output file
            }
        });
    });

    // Handle the last buffered line when the read stream ends
    readStream.on('end', () => {
        if (buffer.startsWith(targetDate)) { // Check if remaining buffer matches target date
            writeStream.write(buffer + '\n'); // Write it to the output file
        }
        writeStream.end(); // Close the write stream
        console.log(`Logs for ${targetDate} extracted successfully to ${outputFile}`);
    });

    // Handle any errors during the read process
    readStream.on('error', (err) => console.error('Error:', err));
}

// Get the command line arguments (log file path and target date)
const logFilePath = process.argv[2];
const dateToExtract = process.argv[3];

// Call the main function with the provided arguments
extractLogs(logFilePath, dateToExtract);
*/

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
