import time

from llama_index.node_parser import SimpleNodeParser
from llama_index.schema import BaseNode, Document, NodeWithScore
from llama_index.text_splitter import CodeSplitter
from llama_index.vector_stores import VectorStoreQueryResult

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
    @staticmethod
    def get_nodes_from_documents(
        documents: list[Document],
        **kwargs,
    ) -> list[BaseNode]:
        start_time = time.time()
        docs: dict[str, list[Document]] = {}

        for document in documents:
            ext = "generic"
            filename = document.metadata.get("filename")
            if filename:
                ext = filename.split(".")[-1]
            if ext in supported_languages:
                if docs.get(ext):
                    docs[supported_languages[ext]].append(document)
                else:
                    docs[supported_languages[ext]] = [document]
            else:
                if docs.get("generic"):
                    docs["generic"].append(document)
                else:
                    docs["generic"] = [document]

        all_nodes: list[BaseNode] = []
        for language in docs:
            if language == "generic":
                np = SimpleNodeParser.from_defaults(**kwargs)
            else:
                np = SimpleNodeParser.from_defaults(
                    text_splitter=CodeSplitter(language=language),
                    **kwargs,
                )
            try:
                nodes = np.get_nodes_from_documents(docs[language])
                all_nodes.extend(nodes)
            except Exception as e:
                logger.warning(f"Error in parsing a document: {e}")
                pass

        logger.debug(
            f"Time taken to convert documents to nodes: [{round(time.time() - start_time, 4)} s]"
        )
        return all_nodes

    @staticmethod
    def get_scored_nodes_from_query_results(
        query_results: list[VectorStoreQueryResult],
        min_similarity_score: int = 0.5,
        max_sources: int = 5,
    ) -> list[NodeWithScore]:
        nodes_with_score = []
        for result in query_results:
            for index, node in enumerate(result.nodes):
                score = 0
                if result.similarities is not None:
                    score = result.similarities[index]
                if score > min_similarity_score:
                    nodes_with_score.append(NodeWithScore(node=node, score=score))
        sorted_nodes_with_score = sorted(
            nodes_with_score, key=lambda x: x.score, reverse=True
        )
        return sorted_nodes_with_score[: min(len(sorted_nodes_with_score), max_sources)]
