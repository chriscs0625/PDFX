import { theme } from "../pdf-theme";

describe("PDF Theme", () => {
  it("should have correct primary color", () => {
    expect(theme.colors.primary).toBe("#2563eb");
  });

  it("should have defined font sizes", () => {
    expect(theme.typography.sizes.h1).toBe(24);
    expect(theme.typography.sizes.body).toBe(10);
  });
});