try:
    import pypdf as PyPDF2
except ImportError:
    try:
        import PyPDF2
    except ImportError:
        raise ImportError("Neither 'pypdf' nor 'PyPDF2' is installed. Please install one of them.")

def extract_pdf_text(file_path):
    """Extracts all text from a PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() or ""
        return text
    except Exception as e:
        raise Exception(f"Failed to read PDF: {e}")
