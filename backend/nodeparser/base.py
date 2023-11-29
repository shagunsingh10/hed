import time

from llama_index.node_parser import SimpleNodeParser
from llama_index.schema import BaseNode, Document
from llama_index.text_splitter import CodeSplitter
from embeddings.factory import get_embedding_model
from utils.logger import get_logger

supported_languages = {
    ".bash": "bash",
    ".c": "c",
    ".cs": "c-sharp",
    ".lisp": "commonlisp",
    ".cpp": "cpp",
    ".css": "css",
    ".dockerfile": "dockerfile",
    ".dot": "dot",
    ".elisp": "elisp",
    ".ex": "elixir",
    ".elm": "elm",
    ".et": "embedded-template",
    ".erl": "erlang",
    ".f": "fixed-form-fortran",
    ".f90": "fortran",
    ".go": "go",
    ".mod": "go-mod",
    ".hack": "hack",
    ".hs": "haskell",
    ".hcl": "hcl",
    ".html": "html",
    ".java": "java",
    ".js": "javascript",
    ".jsdoc": "jsdoc",
    ".json": "json",
    ".jl": "julia",
    ".kt": "kotlin",
    ".lua": "lua",
    ".mk": "make",
    ".md": "markdown",
    ".m": "objc",
    ".ml": "ocaml",
    ".pl": "perl",
    ".php": "php",
    ".py": "python",
    ".ql": "ql",
    ".r": "r",
    ".regex": "regex",
    ".rst": "rst",
    ".rb": "ruby",
    ".rs": "rust",
    ".scala": "scala",
    ".sql": "sql",
    ".sqlite": "sqlite",
    ".toml": "toml",
    ".tsq": "tsq",
    ".tsx": "typescript",
    ".ts": "typescript",
    ".yaml": "yaml",
}

logger = get_logger("node-parser")


class NodeParser:
    def __init__(self, embed_model: str, embed_model_kwargs={}):
        """
        Initializes a NodeParser instance with an embedding model.

        Parameters:
        - embed_model (str): Name of the embedding model to use.
        - embed_model_kwargs (dict): Keyword arguments to pass to the embedding model.
        """
        self.model = get_embedding_model(embed_model, **embed_model_kwargs)

    def _split_docs_into_nodes(self, docs: list[Document]) -> list[BaseNode]:
        """
        Splits a list of documents into language-specific nodes using SimpleNodeParser.

        Parameters:
        - docs (list[Document]): List of Document objects to be split into nodes.

        Returns:
        - list[BaseNode]: List of language-specific nodes.
        """
        start_time = time.time()
        docs_dict = {"generic": []}

        for document in docs:
            ext = (
                document.metadata.get("filename", "").split(".")[-1]
                if document.metadata
                else "generic"
            )
            key = supported_languages.get(ext, "generic")
            docs_dict.setdefault(key, []).append(document)

        all_nodes = []
        for language, doc_list in docs_dict.items():
            text_splitter = None
            if language != "generic":
                text_splitter = CodeSplitter(language=language)

            try:
                np = SimpleNodeParser.from_defaults(text_splitter=text_splitter)
                nodes = np.get_nodes_from_documents(doc_list)
                all_nodes.extend(nodes)
            except Exception as e:
                logger.warning(
                    f"Error in parsing document -> {document.metadata.get('filename')}: {e}"
                )

        logger.debug(f"Chunked docs in: [{round(time.time() - start_time, 4)} s]")
        return all_nodes

    def _embed_nodes(self, nodes: list[BaseNode]) -> list[BaseNode]:
        """
        Embeds text from nodes using the initialized embedding model.

        Parameters:
        - nodes (list[BaseNode]): List of nodes to be embedded.

        Returns:
        - list[BaseNode]: List of nodes with embedded representations.
        """
        start_time = time.time()
        text = [node.text for node in nodes]
        embeddings = self.model.embed_documents(text)
        assert len(nodes) == len(embeddings)
        for node, embedding in zip(nodes, embeddings):
            node.embedding = embedding
        logger.debug(f"Embedded nodes in: [{round(time.time() - start_time, 4)} s]")
        return nodes

    def get_embedded_nodes(self, documents: list[Document]) -> list[BaseNode]:
        """
        Processes a list of documents, splits them into nodes, and embeds the nodes.

        Parameters:
        - documents (list[Document]): List of documents to be processed.

        Returns:
        - list[BaseNode]: List of embedded nodes.
        """
        nodes = self._split_docs_into_nodes(documents)
        embedded_nodes = self._embed_nodes(nodes)
        return embedded_nodes
