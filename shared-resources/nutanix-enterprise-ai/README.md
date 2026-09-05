# Nutanix Enterprise AI

Primary OpenAI-compatible inference gateway for this portal.

Operators save the base URL, API key, and model on `/#/resources`.
Those values stay in the browser. Completions call
`{baseUrl}/chat/completions` first. If that call fails, the client
tries OpenRouter when it is enabled.
