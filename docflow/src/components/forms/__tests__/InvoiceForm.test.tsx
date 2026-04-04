import { render, screen } from "@testing-library/react";
import { InvoiceForm } from "../InvoiceForm";

describe("InvoiceForm", () => {
  it("should render the invoice form correctly", () => {
    const mockOnChange = jest.fn();
    render(<InvoiceForm data={{}} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Invoice Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Client Name/i)).toBeInTheDocument();
  });
});