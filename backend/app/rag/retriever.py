from pathlib import Path
from typing import Any
from app.core.config import settings
from app.rag.ingestion import load_documents, chunk_documents


def retrieve_passages(query: str, limit: int = 5) -> list[dict[str, Any]]:
    chunks = chunk_documents(load_documents(settings.scheme_data_path))
    if not chunks:
        return []
    try:
        import chromadb
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        client = chromadb.PersistentClient(path=settings.chroma_path)
        collection = client.get_or_create_collection("khetsathi-scheme-library", metadata={"hnsw:space": "cosine"})
        known = set(collection.get(include=[]).get("ids", []))
        missing = [chunk for chunk in chunks if chunk["id"] not in known]
        if missing:
            vectors = model.encode([item["text"] for item in missing], normalize_embeddings=True).tolist()
            collection.add(
                ids=[item["id"] for item in missing],
                documents=[item["text"] for item in missing],
                metadatas=[{"source": item["source"], "page": str(item["page"])} for item in missing],
                embeddings=vectors,
            )
        vector = model.encode([query], normalize_embeddings=True).tolist()[0]
        found = collection.query(query_embeddings=[vector], n_results=min(limit, collection.count()))
        results = []
        for index, text in enumerate((found.get("documents") or [[]])[0]):
            meta = (found.get("metadatas") or [[]])[0][index]
            results.append({"text": text, "source": meta.get("source"), "page": meta.get("page"), "score": None})
        return results
    except Exception:
        terms = {word.lower().strip(".,!?()[]{}") for word in query.split() if len(word) > 3}
        ranked = []
        for item in chunks:
            haystack = item["text"].lower()
            score = sum(1 for term in terms if term in haystack)
            if score:
                ranked.append({**item, "score": score})
        ranked.sort(key=lambda item: item["score"], reverse=True)
        return ranked[:limit]
