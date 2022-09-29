const fs = require("fs");
const path = require("path");
const fsRead = (...args) =>
  new Promise((resolve, reject) =>
    fs.read(...args, (err, bytesRead, buffer) => {
      if (err) reject(err);
      else resolve(bytesRead, buffer);
    })
  );

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
    this.pageSize = pageSize || 0x1 << 8;
    while (this.pageSize < stats.blksize) {
      this.pageSize = this.pageSize << 1;
    }
    this.totalSize = stats.size;
    this.readWatermark = 1024 ** 2; // 1mb
    this.readLimit = 1024 ** 4; // 1g
  }

  /**
   * TODO:
   * 1. write
   * 2. error handler
   */

  /**
   * TODO: Handle errors
   */
  async *readPerPage(pos, len, pageSize) {
    if (pos > this.totalSize || len <= 0 || pageSize <= 0)
      return Buffer.alloc(0);

    const totalPages = Math.ceil(
      Math.min(len, this.totalSize - pos) / pageSize
    );

    let curPage = 0,
      curBuffer = Buffer.alloc(pageSize);

    while (curPage < totalPages) {
      const { bytesRead } = await fsRead(
        this.fd.fd,
        curBuffer,
        0,
        pageSize,
        curPage * pageSize + pos
      );
      if (bytesRead <= 0) {
        break;
      }

      yield curBuffer;
      curPage++;
    }

    return curBuffer;
  }

  /**
   * TODO: Handle other events such as `close`. Use the stream property instead of requesting a stream for each read
   */
  async *readPerBlock(pos, len) {
    if (pos > this.totalSize || len <= 0) return Buffer.alloc(0);

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
          restLen -= curBuffer.length;
          if (restLen <= 0) hasData = false;

          resolve();
        });
        stream.on("end", () => {
          hasData = false;
          resolve();
        });
        stream.on("close", () => {
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
   * TODO: Handle errors.
   * @param {number} pos
   * @param {number} len bytes length
   * @returns {Promise<Buffer | Buffer[]>} return `Buffer[]` if `len > pageSize` else `Buffer`
   */
  async read(pos, len) {
    if (len > this.readLimit)
      throw `You should not use 'read' to read more than 1g of data in one go. It's recommended to handle 'perBlock' or 'perPage' by yourself.`;

    const waterOverflow = len > this.readWatermark;
    const buffers = [];
    const iter = waterOverflow
      ? this.readPerBlock(pos, len)
      : this.readPerPage(pos, len, Math.min(this.pageSize, len));
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

    if (len > this.pageSize) {
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
