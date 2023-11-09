#!/bin/bash

MODEL_PATH="models/llama-2-7b-chat.ggmlv3.q4_0.bin"

ls -l

# Check if the model file exists
if [ ! -f "$MODEL_PATH" ]; then
    # Download the model
    curl -o "$MODEL_PATH" https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q4_0.bin
fi
