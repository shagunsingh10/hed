import uuid

from llama_index.text_splitter import CodeSplitter, SentenceSplitter

from core.schema import Chunk, CustomDoc

DEFAULT_CHUNK_SIZE = 300
DEFAULT_CHUNK_OVERLAP = 100

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


class Chunker:
    def __call__(
        self,
        doc: dict[str, CustomDoc],
        chunk_size=DEFAULT_CHUNK_SIZE,
        chunk_overlap=DEFAULT_CHUNK_OVERLAP,
    ) -> CustomDoc:
        doc = doc.get("item")
        ext = doc.filename.split(".")[-1] if doc.filename else "generic"
        language = supported_languages.get(ext)

        text_splitter = None
        if language:
            text_splitter = CodeSplitter(
                language=language,
                max_chars=chunk_size,
                chunk_lines_overlap=chunk_overlap,
            )
        else:
            text_splitter = SentenceSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )

        text_splits = text_splitter.split_text(doc.text)
        chunks = [Chunk(chunk_id=str(uuid.uuid4()), text=text) for text in text_splits]
        doc.chunks = chunks
        return {"doc": doc}
