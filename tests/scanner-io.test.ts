import { beforeEach, describe, expect, test, vi } from "vitest";
import { open, readdir } from "node:fs/promises";
import { collectFiles } from "../src/scanner.js";

vi.mock("node:fs/promises", () => ({ open: vi.fn(), readdir: vi.fn() }));

const LIMIT = 1024 * 1024;

function handle(content: Buffer, size = content.length, regular = true, chunkSize = Infinity) {
  return {
    stat: vi.fn().mockResolvedValue({ size, isFile: () => regular }),
    readFile: vi.fn().mockResolvedValue(content.toString("utf8")),
    read: vi.fn(async (buffer: Buffer, offset: number, length: number, position: number) => {
      const bytesRead = Math.min(length, chunkSize, Math.max(0, content.length - position));
      content.copy(buffer, offset, position, position + bytesRead);
      return { bytesRead, buffer };
    }),
    close: vi.fn().mockResolvedValue(undefined)
  };
}

describe("filesystem collection boundaries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(readdir).mockResolvedValue([
      { name: "README.md", isDirectory: () => false, isFile: () => true }
    ] as never);
  });

  test("discards files that grow beyond the cap after their initial stat", async () => {
    const file = handle(Buffer.alloc(LIMIT + 200, "x"), 12);
    vi.mocked(open).mockResolvedValue(file as never);
    expect(await collectFiles("synthetic-root")).toHaveLength(0);
    expect(file.close).toHaveBeenCalledOnce();
    expect(file.readFile).not.toHaveBeenCalled();
    expect(file.read.mock.calls.reduce((sum, call) => sum + call[2], 0)).toBeLessThanOrEqual(LIMIT + 1);
  });

  test("does not read replacements that are no longer regular files", async () => {
    const file = handle(Buffer.from("unsafe replacement"), 18, false);
    vi.mocked(open).mockResolvedValue(file as never);
    expect(await collectFiles("synthetic-root")).toHaveLength(0);
    expect(file.readFile).not.toHaveBeenCalled();
    expect(file.read).not.toHaveBeenCalled();
    expect(file.close).toHaveBeenCalledOnce();
  });

  test("tolerates a file disappearing after directory enumeration", async () => {
    vi.mocked(open).mockRejectedValue(Object.assign(new Error("removed"), { code: "ENOENT" }));
    expect(await collectFiles("synthetic-root")).toEqual([]);
  });

  test("keeps permission errors visible rather than reporting a clean scan", async () => {
    const error = Object.assign(new Error("denied"), { code: "EACCES" });
    vi.mocked(open).mockRejectedValue(error);
    await expect(collectFiles("synthetic-root")).rejects.toBe(error);
  });

  test("assembles partial UTF-8 reads before decoding", async () => {
    const content = "Lesen 中文 äöü";
    const file = handle(Buffer.from(content), Buffer.byteLength(content), true, 2);
    vi.mocked(open).mockResolvedValue(file as never);
    expect(await collectFiles("synthetic-root")).toEqual([{ path: "README.md", content }]);
    expect(file.close).toHaveBeenCalledOnce();
  });

  test("closes the handle when a read fails and propagates the error", async () => {
    const file = handle(Buffer.from("test"));
    const error = Object.assign(new Error("read failure"), { code: "EIO" });
    file.read.mockRejectedValue(error);
    file.readFile.mockRejectedValue(error);
    vi.mocked(open).mockResolvedValue(file as never);
    await expect(collectFiles("synthetic-root")).rejects.toBe(error);
    expect(file.close).toHaveBeenCalledOnce();
  });
});
