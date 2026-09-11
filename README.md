# Pi provider rotation

This extension keeps OpenRouter’s free models in order and uses each model until it fails. When OpenRouter reports its account-wide `free-models-per-day` limit, Pi switches to a separately configured Groq endpoint.

The Groq fallback uses `openai/gpt-oss-20b` through Groq’s OpenAI-compatible API. It is only available when `GROQ_API_KEY` is configured. No Gemini, Hugging Face, Ollama, or paid OpenRouter fallback is configured.

## Install

Copy the extension into Pi’s global extension directory:

```sh
cp openrouter-free-fallback.ts ~/.pi/agent/extensions/
```

Store the Groq key in Pi’s credential file under the custom provider name:

```json
{
  "openrouter": { "type": "api_key", "key": "..." },
  "groq-direct": { "type": "api_key", "key": "gsk_..." }
}
```

Alternatively, export `GROQ_API_KEY` before starting Pi. Do not commit credentials.

Run Pi from a project directory and restart it after installing the extension. On OpenRouter’s account-wide free limit, the next retry switches to Groq. Groq’s free-plan limits still apply; this configuration does not enable or request paid usage.

## Verify

Use `pi --verbose` or a short prompt. OpenRouter failures should advance through the configured free-model sequence; an error containing `free-models-per-day` should cause the next retry to use `groq-direct/openai/gpt-oss-20b`.
