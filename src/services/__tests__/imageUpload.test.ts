import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadImage, type UploadImageInput } from "../imageUpload";
import type { Image } from "@/db/schema";

// --- Mocks ---

const mockPutObject = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/lib/r2", () => ({
  putObject: (...args: unknown[]) => mockPutObject(...args),
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: (values: unknown) => mockInsert(values),
    }),
  },
}));

// --- Fixtures ---

function makeInput(overrides: Partial<UploadImageInput> = {}): UploadImageInput {
  return {
    userId: "user_abc123",
    filename: "cat.png",
    mimeType: "image/png",
    sizeBytes: 1024,
    buffer: Buffer.from("fake-image-data"),
    title: "My Cat",
    description: "A photo of my cat",
    tags: ["pets", "cats"],
    ...overrides,
  };
}

// --- Tests ---

describe("uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue(undefined);
    mockPutObject.mockResolvedValue(undefined);
  });

  it("rejects files over 5MB", async () => {
    const input = makeInput({ sizeBytes: 6 * 1024 * 1024 });
    await expect(uploadImage(input)).rejects.toThrow(/5MB/);
  });

  it("rejects disallowed MIME types", async () => {
    const input = makeInput({ mimeType: "application/pdf" });
    await expect(uploadImage(input)).rejects.toThrow(/mime type/i);
  });

  it("puts the object in R2 with the correct key and content type", async () => {
    const input = makeInput();
    await uploadImage(input);

    expect(mockPutObject).toHaveBeenCalledOnce();
    const [key, buffer, contentType] = mockPutObject.mock.calls[0];
    expect(key).toMatch(/^user_abc123\//);         // key is scoped to user
    expect(key).toMatch(/\.png$/);                 // extension preserved
    expect(buffer).toBe(input.buffer);
    expect(contentType).toBe("image/png");
  });

  it("writes metadata to D1 with the correct fields", async () => {
    const input = makeInput();
    await uploadImage(input);

    expect(mockInsert).toHaveBeenCalledOnce();
    const record = mockInsert.mock.calls[0][0] as Image;
    expect(record.userId).toBe("user_abc123");
    expect(record.filename).toBe("cat.png");
    expect(record.mimeType).toBe("image/png");
    expect(record.sizeBytes).toBe(1024);
    expect(record.title).toBe("My Cat");
    expect(record.description).toBe("A photo of my cat");
    expect(record.tags).toEqual(["pets", "cats"]);
    expect(record.r2Key).toMatch(/^user_abc123\//);
    expect(record.id).toBeTruthy();
  });

  it("returns the saved image record", async () => {
    const input = makeInput();
    const result = await uploadImage(input);

    expect(result).toMatchObject<Partial<Image>>({
      userId: "user_abc123",
      filename: "cat.png",
      mimeType: "image/png",
    });
    expect(result.id).toBeTruthy();
    expect(result.r2Key).toBeTruthy();
  });

  it("does not write to D1 if R2 upload fails", async () => {
    mockPutObject.mockRejectedValue(new Error("R2 unavailable"));
    const input = makeInput();
    await expect(uploadImage(input)).rejects.toThrow("R2 unavailable");
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
