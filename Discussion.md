## Approach 1: Using Streams with Readline (Single-threaded)

### Pros:
- **Memory Efficient**: Reads one line at a time instead of loading the entire file into memory.
- **Fast Execution**: Only processes relevant lines.
- **Scalable**: Handles large files without memory overflow.

### Cons:
- **Single-threaded**: Slower if I/O is a bottleneck.
- **No Parallelism**: Processes one line at a time.

---

## Approach 2: Using Native Streams Without Readline (Single-threaded)

Instead of using `readline`, we can manually process chunks using `fs.createReadStream`.

### Pros:
- **More Efficient**: Processes larger chunks at a time, making it faster than `readline`.
- **Reduced Overhead**: Fewer function calls compared to `readline`.

### Cons:
- **Chunk Splitting**: Log entries might be split across chunks, requiring careful handling.
- **Still Single-threaded**: No parallel processing improvements.

---

## Approach 3: Parallel Log Extraction Using Worker Threads(used this)

### Pros :
- **Parallel chunks**: Since it divides the file into chunks and processes them in parallel, it can extract logs significantly faster, especially for large files.