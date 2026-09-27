from io import BytesIO

from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF file.

    Args:
        pdf_bytes: PDF file content as bytes.

    Returns:
        Extracted text as a string.
    """

    if not pdf_bytes:
        raise ValueError("PDF file is empty.")

    try:
        pdf_file = BytesIO(pdf_bytes)

        reader = PdfReader(pdf_file)

        if not reader.pages:
            raise ValueError("PDF does not contain any pages.")

        extracted_text = []

        for page_number, page in enumerate(reader.pages, start=1):

            try:
                text = page.extract_text()

                if text:
                    extracted_text.append(text)

            except Exception as page_error:
                print(
                    f"Warning: Could not extract page "
                    f"{page_number}: {page_error}"
                )

        final_text = "\n\n".join(extracted_text).strip()

        if not final_text:
            raise ValueError(
                "No readable text was found in the PDF. "
                "The PDF may be scanned/image-based."
            )

        return final_text

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            f"Failed to read PDF: {str(error)}"
        )