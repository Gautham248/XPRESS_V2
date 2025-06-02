import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FileUploader, { FileUploaderProps } from "./FileUploader";

const mockProps: Partial<FileUploaderProps> = {
  onFileSelect: jest.fn(),
  selectedFile: null,
};

const setup = (props?: Partial<FileUploaderProps>) =>
  render(<FileUploader {...mockProps} {...props} />);

describe("FileUploader Component", () => {
  it("renders upload area when no file is selected", () => {
    setup();
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf, jpg, or png/i)).toBeInTheDocument();
  });

  test.each([
    ["JPG", "photo.jpg", "image/jpeg"],
    ["JPEG", "photo.jpeg", "image/jpeg"],
    ["PNG", "image.png", "image/png"],
  ])("shows image preview for %s files", async (_, fileName, mimeType) => {
    setup();
    const input = screen.getByLabelText(/upload/i);
    const file = new File(["image content"], fileName, { type: mimeType });

    fireEvent.change(input, { target: { files: [file] } });

    // Simulate clicking to preview
    const fileTile = await screen.findByText(fileName);
    fireEvent.click(fileTile);

    const previewImage = await screen.findByAltText(/preview/i);
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute("src");
  });

  it("shows PDF preview when a PDF is uploaded", async () => {
    setup();
    const input = screen.getByLabelText(/upload/i);
    const file = new File(["%PDF-content"], "sample.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [file] } });

    const fileTile = await screen.findByText("sample.pdf");
    fireEvent.click(fileTile);

    const iframe = await screen.findByTitle("PDF Preview");
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe("IFRAME");
  });

  it("shows error if file exceeds size limit", async () => {
    setup();
    const input = screen.getByLabelText(/upload/i);
    const largeFile = new File(["a".repeat(11 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(
      await screen.findByText(/file size exceeds 10MB/i)
    ).toBeInTheDocument();
  });

  it("shows required error when validation is on and no file is selected", () => {
    setup({ showValidation: true, selectedFile: null });
    expect(screen.getByText(/file is required/i)).toBeInTheDocument();
  });

  it("removes the file when X button is clicked", async () => {
    const file = new File(["hello"], "test.png", { type: "image/png" });
    const onFileSelect = jest.fn();

    setup({ selectedFile: file, onFileSelect });

    const removeBtn = await screen.findByRole("button", {
      name: /remove file/i,
    });

    fireEvent.click(removeBtn);

    expect(onFileSelect).toHaveBeenCalledWith(null);
  });
});
