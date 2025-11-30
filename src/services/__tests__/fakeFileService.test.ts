import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFakeFiles } from "../fakeFileService";

describe("fakeFileService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("fetchFakeFiles", () => {
    it("should return root folder children after delay", async () => {
      const promise = fetchFakeFiles("root");

      // Fast-forward time to skip the delay
      vi.advanceTimersByTime(1000);

      const result = await promise;

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return correct files for root folder", async () => {
      const promise = fetchFakeFiles("root");
      vi.advanceTimersByTime(1000);
      const result = await promise;

      // Check that we have the expected files
      const fileNames = result.map((node) => node.name);

      expect(fileNames).toContain("witty-pike.png");
      expect(fileNames).toContain("eldest-mink.jpg");
      expect(fileNames).toContain("moaning-tapir.doc");
      expect(fileNames).toContain("artistic-harrier.jpg");
      expect(fileNames).toContain("integrated-bass.doc");
      expect(fileNames).toContain("safe-ostrich.png");
      expect(fileNames).toContain("guilty-egret");
    });

    it("should return files with correct types and sizes", async () => {
      const promise = fetchFakeFiles("root");
      vi.advanceTimersByTime(1000);
      const result = await promise;

      const file = result.find((node) => node.name === "witty-pike.png");
      expect(file).toBeDefined();
      expect(file?.type).toBe("file");
      expect(file?.sizeKB).toBe(30);

      const folder = result.find((node) => node.name === "guilty-egret");
      expect(folder).toBeDefined();
      expect(folder?.type).toBe("folder");
      expect(folder?.loadChildren).toBeDefined();
    });

    it("should return correct children for guilty-egret folder", async () => {
      const promise = fetchFakeFiles("root-guilty-egret");
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result.length).toBe(4);

      const fileNames = result.map((node) => node.name);
      expect(fileNames).toContain("mysterious-goldfish.doc");
      expect(fileNames).toContain("sick-dragonfly");
      expect(fileNames).toContain("nutritious-marlin.doc");
      expect(fileNames).toContain("fortunate-felidae.jpg");
    });

    it("should return nested folder with loadChildren function", async () => {
      const promise = fetchFakeFiles("root-guilty-egret");
      vi.advanceTimersByTime(1000);
      const result = await promise;

      const folder = result.find((node) => node.name === "sick-dragonfly");
      expect(folder).toBeDefined();
      expect(folder?.type).toBe("folder");
      expect(folder?.loadChildren).toBeDefined();
      expect(typeof folder?.loadChildren).toBe("function");
    });

    it("should generate random children for unknown folders", async () => {
      const promise = fetchFakeFiles("unknown-folder");
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(4);

      // Check that all nodes have required properties
      result.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(node.name).toBeDefined();
        expect(node.type).toBeDefined();
        expect(["file", "folder"]).toContain(node.type);

        if (node.type === "file") {
          expect(node.sizeKB).toBeDefined();
          expect(node.sizeKB).toBeGreaterThan(0);
        } else {
          expect(node.loadChildren).toBeDefined();
        }
      });
    });

    it("should simulate network delay", async () => {
      const promise = fetchFakeFiles("root");

      // Don't advance timers - let it wait
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });

      // Wait a bit but not enough
      vi.advanceTimersByTime(500);
      await Promise.resolve(); // Let promises settle
      expect(resolved).toBe(false);

      // Now advance the rest
      vi.advanceTimersByTime(500);
      await promise;
      expect(resolved).toBe(true);
    });
  });
});
