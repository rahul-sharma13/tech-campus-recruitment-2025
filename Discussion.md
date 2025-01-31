# The log file (logs_2024.log) should be located in the /logs directory in root.

## Approach 1: Using Streams with Readline (Single-threaded)

### Pros:

- **Memory Efficient**: Reads one line at a time instead of loading the entire file into memory.
- **Fast Execution**: Only processes relevant lines.
- **Scalable**: Handles large files without memory overflow.

### Cons:

- **Single-threaded**: Slower if I/O is a bottleneck.
- **No Parallelism**: Processes one line at a time.

### Intuition:
 - Instead of reading the entire log file into memory, this approach uses Node.js streams along with the readline module to process logs line by line. This ensures memory efficiency, making it ideal for large log files.

---

## Approach 2: Using Native Streams Without Readline (Single-threaded)

Instead of using `readline`, we can manually process chunks using `fs.createReadStream`.

### Pros:

- **More Efficient**: Processes larger chunks at a time, making it faster than `readline`.
- **Reduced Overhead**: Fewer function calls compared to `readline`.

### Cons:

- **Chunk Splitting**: Log entries might be split across chunks, requiring careful handling.
- **Still Single-threaded**: No parallel processing improvements.

### Intuition:
 - Instead of using readline, this approach directly processes file chunks using fs.createReadStream(). This allows reading larger portions of the file at once, reducing function call overhead.

---

## Approach 3: Parallel Log Extraction Using Worker Threads(used this)

### Pros :

- **Parallel chunks**: Since it divides the file into chunks and processes them in parallel, it can extract logs significantly faster, especially for large files.

- **How it works**: This method divides the burden among several threads by processing huge log files in parallel using Node.js Worker Threads. The log file is divided into smaller portions, and each worker works the given section individually rather than processing the file in a sequential manner. After that, the outcomes are combined and saved to the output file.

How It Operates: The number of worker threads determines the log file size, which is then split into equal-sized portions.
Every employee reads a portion of the file and pulls pertinent log entries that correspond to the desired date.
After all workers have finished their jobs, the main thread compiles the output into a single file.

### Intuition:
 - To handle very large log files efficiently, this approach splits the file into smaller chunks and assigns each chunk to a separate worker thread. Each worker processes its chunk independently, significantly improving performance by leveraging multiple CPU cores.
