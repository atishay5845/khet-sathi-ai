from pathlib import Path
from typing import Any


def load_documents(directory: str | Path) -> list[dict[str, Any]]:
    """Load local Markdown/TXT and PDF pages with source metadata."""
    root = Path(directory)
    documents: list[dict[str, Any]] = []
    if not root.exists():
        return documents
    for file in sorted(root.iterdir()):
        suffix = file.suffix.lower()
        if suffix in {".md", ".txt"}:
            text = file.read_text(encoding="utf-8", errors="ignore")
            if text.strip():
                documents.append({"id": file.stem, "source": file.name, "page": "Document", "text": text})
        elif suffix == ".pdf":
            try:
                import fitz
                with fitz.open(file) as pdf:
                    for page_number, page in enumerate(pdf, start=1):
                        text = page.get_text("text").strip()
                        if text:
                            documents.append({"id": f"{file.stem}-p{page_number}", "source": file.name, "page": page_number, "text": text})
            except Exception:
                # One unreadable PDF should not prevent all other scheme documents loading.
                continue
    return documents


def chunk_documents(documents: list[dict[str, Any]], chunk_size: int = 900, overlap: int = 140) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    for document in documents:
        text = document["text"]
        start = 0
        index = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()
            if chunk:
                chunks.append({
                    "id": f"{document['id']}-{index}",
                    "source": document["source"],
                    "page": document.get("page", "Document"),
                    "text": chunk,
                })
            if end >= len(text):
                break
            start = max(end - overlap, start + 1)
            index += 1
    return chunks
