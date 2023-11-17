from typing import Optional

from llama_index.node_parser import SimpleNodeParser
from llama_index.schema import BaseNode, Document
from llama_index.text_splitter import CodeSplitter

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


class NodeParser:
    @staticmethod
    def get_nodes_from_documents(
        documents: list[Document],
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        **kwargs,
    ) -> list[BaseNode]:
        docs: dict[str, list[Document]] = {}

        for document in documents.iter_rows():
            ext = document.metadata["extension"]
            if ext in supported_languages:
                if docs.get(ext):
                    docs[supported_languages[ext]].append(document)
                else:
                    docs[supported_languages[ext]] = [document]
            else:
                if docs.get("generic"):
                    docs[supported_languages["generic"]].append(document)
                else:
                    docs[supported_languages["generic"]] = [document]

        all_nodes: list[BaseNode] = []
        for language in docs:
            if language == "generic":
                np = SimpleNodeParser.from_defaults(
                    chunk_size=chunk_size, chunk_overlap=chunk_overlap, **kwargs
                )
            else:
                np = SimpleNodeParser.from_defaults(
                    text_splitter=CodeSplitter(language=language),
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap,
                    **kwargs,
                )
            nodes = np.get_nodes_from_documents(docs[language])
            all_nodes.extend(nodes)

        return all_nodes
