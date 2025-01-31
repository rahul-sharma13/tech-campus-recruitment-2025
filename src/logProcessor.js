const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');

const { logFile, targetDate, start, end } = workerData;
const stream = fs.createReadStream(logFile, { start, end, encoding: 'utf-8' });
let buffer = '';
let result = '';

stream.on('data', (chunk) => {
    buffer += chunk;
    let lines = buffer.split('\n');
    buffer = lines.pop(); // Keep last incomplete line

    lines.forEach(line => {
        if (line.startsWith(targetDate)) {
            result += line + '\n';
        }
    });
});

stream.on('end', () => {
    parentPort.postMessage(result);
});
