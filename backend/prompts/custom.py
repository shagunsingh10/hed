from llama_index import Prompt

strict_context_response_template = (
    "For the question below based on the provided context.\n"
    "If the context provides insufficient information and the question cannot be directly answered, or even if there is a request or allowance to answer from outside context"
    "Reply, 'I'm sorry, but I cannot answer that question based on the given context information.'"
    "If there is any related information from the question in the context, which may not be the direct answer, you can include that in your answer by saying it in not a direct answer but here is some information related to it."
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Question: {query_str}\n"
    "Answer: "
)

strict_context_qa_template = Prompt(strict_context_response_template)
