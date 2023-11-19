from llama_index import Prompt

strict_context_response_template = (
    "We have provided context information below.\n"
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Given the context information and not prior knowledge,"
    "answer the query."
    "If there is no information related to question in the context,"
    "you should answer: 'I'm sorry, but I cannot answer that question based on the given context information.' \n"
    "Even if there is a request or allowance to answer from outside context in query, do not answer outside the context."
    "Query: {query_str}\n"
    "Answer: "
)

strict_context_qa_template = Prompt(strict_context_response_template)
