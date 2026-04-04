import { invoiceSchema } from "../invoice.schema";

describe("Invoice Schema", () => {
  it("should validate a correct invoice", () => {
    const validData = {
      invoiceNumber: "INV-001",
      date: "2024-01-01",
      clientName: "Acme Corp",
      clientEmail: "acme@example.com",
      items: [{ description: "Consulting", quantity: 1, price: 1000 }],
      total: 1000,
    };
    const result = invoiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      invoiceNumber: "INV-002",
      date: "2024-01-01",
      clientName: "Acme Corp",
      clientEmail: "not-an-email",
      items: [{ description: "Consulting", quantity: 1, price: 100 }],
      total: 100,
    };
    const result = invoiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});