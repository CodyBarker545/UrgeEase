# test_rag_chain_urgeease.py
import os
from pathlib import Path

import pytest

from rag_chain import (
    RAGConfig,
    HashEmbeddings,
    UrgeEaseRAGChain,
    is_crisis,
)


@pytest.fixture()
def tmp_rag_project(tmp_path: Path):
    """
    Creates a temporary data + index folder with one text file.
    """
    data_dir = tmp_path / "data"
    index_dir = tmp_path / "vectorstore"
    data_dir.mkdir()
    index_dir.mkdir()

    sample = (
        "UrgeEase Notes\n\n"
        "If the user has an urge, suggest urge surfing: wait 10 minutes and breathe.\n"
        "Also identify triggers: time, mood, environment.\n"
    )
    (data_dir / "guide.txt").write_text(sample, encoding="utf-8")

    return str(data_dir), str(index_dir)


def test_is_crisis_detection():
    assert is_crisis("I want to kill myself") is True
    assert is_crisis("I feel tempted to scroll social media") is False


def test_rag_retrieves_documents(tmp_rag_project):
    data_dir, index_dir = tmp_rag_project
    cfg = RAGConfig(data_dir=data_dir, index_dir=index_dir, k=2)

    chain = UrgeEaseRAGChain(cfg, embeddings=HashEmbeddings())

    result = chain.invoke("What should I do when I feel an urge?")
    assert result["crisis"] is False
    assert "result" in result
    assert len(result["source_documents"]) > 0

    # Make sure retrieved chunk contains expected phrase
    joined = "\n".join([d.page_content.lower() for d in result["source_documents"]])
    assert "urge surfing" in joined or "wait 10 minutes" in joined


def test_crisis_short_circuits_rag(tmp_rag_project):
    data_dir, index_dir = tmp_rag_project
    cfg = RAGConfig(data_dir=data_dir, index_dir=index_dir)

    chain = UrgeEaseRAGChain(cfg, embeddings=HashEmbeddings())

    result = chain.invoke("I want to end my life.")
    assert result["crisis"] is True
    assert result["source_documents"] == []
    assert "988" in result["result"] or "911" in result["result"]