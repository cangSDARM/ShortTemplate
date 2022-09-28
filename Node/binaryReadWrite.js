const fs = require("fs");
const path = require("path");
const { constants } = require("buffer");

async function open(fileName, openFlags, cacheSize, pageSize) {
  cacheSize = cacheSize || 4096 * 64;
  if (
    typeof openFlags !== "number" &&
    ["w+", "wx+", "r", "ax+", "a+"].indexOf(openFlags) < 0
  )
    throw new Error("Invalid open option");
  const fd = await fs.promises.open(path.resolve(fileName), openFlags);

  const stats = await fd.stat();

  return new BinaryFile(fd, stats, pageSize);
}

class BinaryFile {
  /**
   * @param {fs.promises.FileHandle} fd
   * @param {fs.Stats} stats
   * @param {number} pageSize
   */
  constructor(fd, stats, pageSize) {
    this.fd = fd;
    this.pageSize = pageSize || 1 << 8;
    while (this.pageSize < stats.blksize) {
      this.pageSize *= 2;
    }
    this.totalSize = stats.size;
  }

  /**
   * TODO:
   * 1. write
   * 2. *perPage
   * 3. error handler
   */

  /**
   * TODO: Use read for smaller size rather than stream. Handle other events such as `close`. Use the stream property instead of requesting a stream for each read
   */
  async *readPerBlock(pos, len) {
    if (pos > this.totalSize) return Buffer.alloc(0);

    const end = len + pos > this.totalSize - pos ? undefined : len + pos;
    const stream = this.fd.createReadStream({
      encoding: null,
      start: pos,
      end: end,
    });
    let hasData = true,
      /** @type {Buffer|null}  */
      curBuffer,
      restLen = len;

    while (hasData) {
      await new Promise((resolve) => {
        stream.on("data", (chunk) => {
          curBuffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
          resolve();

          restLen -= curBuffer.length;
          if (restLen <= 0) hasData = false;
        });
        stream.on("end", () => {
          hasData = false;
          resolve();
        });
      });

      yield curBuffer;
      curBuffer = null;
    }

    return curBuffer;
  }

  /**
   * TODO: Handle errors. Handle more len than 1gig
   * @param {number} pos
   * @param {number} len bytes length
   * @returns {Promise<Buffer | Buffer[]>} return `Buffer[]` if `len > buffers.constants.MAX_LENGTH` else `Buffer`
   */
  async read(pos, len) {
    const buffers = [];
    const iter = this.readPerBlock(pos, len);
    let data = await iter.next();
    while (!data.done) {
      if (data.value) buffers.push(data.value);
      data = await iter.next();
    }

    const blockLens = buffers.reduce((pre, cur) => pre + cur.length, 0);
    if (blockLens > len) {
      buffers[buffers.length - 1] = buffers[buffers.length - 1].subarray(
        0,
        len
      );
    }
    if (blockLens < len) {
      console.warn(
        "Not enough length to read. Reading Length:",
        blockLens,
        "Expecting:",
        len
      );
    }

    if (len > constants.MAX_LENGTH) {
      return buffers;
    }
    return Buffer.concat(buffers);
  }
}

async function main() {
  const file = {
    filePath: "./orcq/LICENSE",
    cacheSize: 1 << 16,
    pageSize: 1 << 13,
  };
  const o = await open(
    file.filePath,
    "r",
    // O_TRUNC | O_CREAT | O_RDWR,
    file.cacheSize,
    file.pageSize
  );
  const ret = await o.read(0, 0xf);
  console.log(ret, "\n" + ret.toString("ascii"));
}

main();
