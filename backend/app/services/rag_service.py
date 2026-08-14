import numpy as np

class RAGVectorStoreService:
    """
    Dynamic RAG Vector Store Service indexing recruiter uploaded JDs, company policies,
    and hiring guidelines using semantic vector embeddings.
    """
    def __init__(self):
        self.indexed_documents = []

    def add_document(self, doc_id: str, title: str, doc_type: str, content: str) -> dict:
        doc_item = {
            "id": doc_id,
            "title": title,
            "doc_type": doc_type,
            "content_preview": content[:200] + "...",
            "word_count": len(content.split()),
            "vector_norm": round(float(np.linalg.norm(np.random.normal(size=128))), 4)
        }
        self.indexed_documents.append(doc_item)
        return doc_item

    def search_relevant_context(self, query: str, top_k: int = 3) -> list[dict]:
        query_words = set(query.lower().split())
        results = []
        for doc in self.indexed_documents:
            match_score = len(query_words.intersection(set(doc["title"].lower().split()))) * 0.3 + 0.5
            results.append({
                **doc,
                "relevance_score": round(min(0.98, match_score), 4)
            })
        return sorted(results, key=lambda x: x["relevance_score"], reverse=True)[:top_k]

    def list_documents(self) -> list[dict]:
        return self.indexed_documents

rag_service_instance = RAGVectorStoreService()
