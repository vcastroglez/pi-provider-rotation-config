# Pi provider rotation

This extension keeps OpenRouter’s free models in order and uses each model until it fails. When OpenRouter reports its account-wide `free-models-per-day` limit, Pi switches to Groq and then Hugging Face if Groq fails.

The direct fallback order is Groq (`openai/gpt-oss-20b`), then Hugging Face (`Qwen/Qwen2.5-7B-Instruct`). They are only available when their credentials are configured. No Gemini, Ollama, or paid OpenRouter fallback is configured.

## Install

Copy the extension into Pi’s global extension directory:

```sh
cp openrouter-free-fallback.ts ~/.pi/agent/extensions/
```

Store the Groq key in Pi’s credential file under the custom provider name:

```json
{
  "openrouter": { "type": "api_key", "key": "..." },
  "groq-direct": { "type": "api_key", "key": "gsk_..." },
  "huggingface-direct": { "type": "api_key", "key": "hf_..." }
}
```

Alternatively, export `GROQ_API_KEY` and `HF_TOKEN` before starting Pi. Do not commit credentials.

Run Pi from a project directory and restart it after installing the extension. On OpenRouter’s account-wide free limit, the next retry switches to Groq, then Hugging Face if Groq fails. Groq’s Free Plan and Hugging Face’s monthly free credits still apply; this configuration does not enable or request paid usage.

## Verify

Use `pi --verbose` or a short prompt. OpenRouter failures should advance through the configured free-model sequence; an error containing `free-models-per-day` should cause the next retry to use Groq, followed by Hugging Face if Groq fails.
