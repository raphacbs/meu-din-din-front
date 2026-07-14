import { describe, expect, it, vi, afterEach } from "vitest";

import { downloadAttachmentFile } from "@/lib/attachments/download";

describe("downloadAttachmentFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("downloads data URLs via object URL and click", async () => {
    const click = vi.fn();
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => "blob:mock");

    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });

    const appendChild = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => node);
    const removeChild = vi
      .spyOn(HTMLAnchorElement.prototype, "remove")
      .mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click);

    const dataUrl =
      "data:text/plain;base64," + Buffer.from("hello", "utf8").toString("base64");

    await downloadAttachmentFile(dataUrl, "recibo.txt");

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    appendChild.mockRestore();
    removeChild.mockRestore();
  });
});
