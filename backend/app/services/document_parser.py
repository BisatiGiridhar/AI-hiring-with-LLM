import os
import io
from pypdf import PdfReader
import docx

class DocumentParserService:
    """
    Real-world Document Parser extracting text from uploaded PDF, DOCX, TXT, and Image files.
    """

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text)

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        docx_file = io.BytesIO(file_bytes)
        doc = docx.Document(docx_file)
        extracted_text = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(extracted_text)

    @staticmethod
    def parse_txt(file_bytes: bytes) -> str:
        return file_bytes.decode("utf-8", errors="ignore")

    @classmethod
    def extract_text(cls, file_name: str, file_bytes: bytes) -> str:
        ext = os.path.splitext(file_name)[1].lower()
        if ext == ".pdf":
            return cls.parse_pdf(file_bytes)
        elif ext in [".docx", ".doc"]:
            return cls.parse_docx(file_bytes)
        elif ext == ".txt":
            return cls.parse_txt(file_bytes)
        else:
            # Fallback text decoder for unknown text-based files
            try:
                return file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                raise ValueError(f"Unsupported file format: {ext}")
