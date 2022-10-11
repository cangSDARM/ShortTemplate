const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const fsRead = (...args) =>
  new Promise((resolve, reject) =>
    fs.read(...args, (err, bytesRead, buffer) => {
      if (err) reject(err);
      else resolve({ bytesRead, buffer });
    })
  );
const fsWrite = (...args) =>
  new Promise((resolve, reject) =>
    fs.write(...args, (err, bytesWritten, buffer) => {
      if (err) reject(err);
      else resolve({ bytesWritten, buffer });
    })
  );

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

    const nodeVer = process.versions.node.split(",");
    this.streamable = parseInt(nodeVer[0], 10) >= 16;
  }

  static async open(
    fileName,
    openFlags,
    cacheSize = 1 << 8,
    pageSize = 1 << 8
  ) {
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

  /**
   * TODO:
   * 1. writePerBlock
   * 2. error handler
   */

  /**
   * @param {String|Buffer|Array<number>} data
   */
  async *writePerPage(pos, data, pageSize) {
    const len = data?.length || -1;
    if (len <= 0 || pageSize <= 0) return;
    pageSize = Math.min(len, pageSize);

    const totalPages = Math.ceil(len / pageSize);

    let curPage = 0,
      curData = undefined,
      curBuffer = undefined;
    while (curPage < totalPages) {
      curData = data[data instanceof Buffer ? "subarray" : "slice"](
        curPage * pageSize,
        (curPage + 1) * pageSize
      );
      curBuffer = curData instanceof Buffer ? curData : Buffer.from(curData);
      const { bytesWritten } = await fsWrite(
        this.fd.fd,
        curBuffer,
        0,
        curBuffer.length,
        curPage * pageSize + pos
      );
      if (bytesWritten <= 0) {
        break;
      }
      yield curData;

      curPage++;
    }

    return curData;
  }

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

      if (curPage === totalPages - 1) {
        curBuffer = curBuffer.subarray(0, bytesRead);
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
    assert.ok(
      len <= this.readLimit,
      `You should not use 'read' to read more than 1g of data in one go.
      It's recommended to handle 'perBlock' or 'perPage' by yourself.`
    );

    const waterOverflow = len > this.readWatermark;

    const buffers = [];
    const iter =
      waterOverflow && this.streamable
        ? this.readPerBlock(pos, len)
        : this.readPerPage(pos, len, Math.min(this.pageSize, len));

    let data = await iter.next();
    while (!data.done) {
      if (data.value) buffers.push(data.value);
      data = await iter.next();
    }

    const blockLens = buffers.reduce((pre, cur) => pre + cur.length, 0);
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
  const b = await BinaryFile.open("../screenshots/2bit.jpg", "r");
  const o = await BinaryFile.open("./writable.jpg", "w+");

  const pageSize = 1 << 13;
  const ri = b.readPerPage(0, Infinity, pageSize);

  let data = await ri.next(),
    times = 0;
  while (!data.done) {
    let wi = await o.writePerPage(pageSize * times, data.value, pageSize),
      wd = await wi.next();
    while (!wd.done) {
      wd = await wi.next();
    }
    data = await ri.next();
    times++;
  }

  // const ret = await o.read(0, 0xf);
  // console.log(ret);
  // console.log(ret.toString("ascii"));
}

main();
