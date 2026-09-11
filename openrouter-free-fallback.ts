import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const OPENROUTER_FREE_MODELS = [
	"inclusionai/ling-3.0-flash-vl:free",
	"nex-agi/nex-n2.5-mini:free",
	"nex-agi/nex-n2.5-pro:free",
	"inclusionai/ling-3.0-flash-sante:free",
	"inclusionai/ling-3.0-flash-fin:free",
	"dots-studio/dots-3-note-preview:free",
	"liquid/lfm-2.5-2.6b:free",
	"nvidia/nemotron-3.5-lightning:free",
	"thinkingmachines/inkling-small:free",
	"poolside/laguna-s-2.1:free",
	"thinkingmachines/inkling:free",
	"poolside/laguna-xs-2.1:free",
	"cohere/north-mini-code:free",
	"nvidia/nemotron-3-ultra-550b-a55b:free",
	"nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
	"google/gemma-4-26b-a4b-it:free",
	"google/gemma-4-31b-it:free",
	"nvidia/nemotron-3-super-120b-a12b:free",
	"openrouter/free",
] as const;

export default function (pi: ExtensionAPI) {
	pi.registerProvider("groq-direct", {
		baseUrl: "https://api.groq.com/openai/v1",
		api: "openai-completions",
		apiKey: "$GROQ_API_KEY",
		models: [{ id: "openai/gpt-oss-20b", reasoning: false, input: ["text"], contextWindow: 131072, maxTokens: 65536, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } }],
	});

	let openrouterIndex = -1;
	let activeProvider = "openrouter";

	const switchToGroq = async (ctx: ExtensionContext) => {
		const model = ctx.modelRegistry.find("groq-direct", "openai/gpt-oss-20b");
		if (!model || !(await pi.setModel(model))) return false;
		activeProvider = "groq-direct";
		return true;
	};

	pi.on("before_provider_request", (event) => {
		if (activeProvider !== "openrouter" || !event.payload || typeof event.payload !== "object") return;
		const payload = event.payload as Record<string, unknown>;
		const requestedModel = payload.model;
		if (typeof requestedModel !== "string" || !requestedModel.endsWith(":free")) return;
		if (openrouterIndex < 0) {
			openrouterIndex = Math.max(0, OPENROUTER_FREE_MODELS.indexOf(requestedModel as (typeof OPENROUTER_FREE_MODELS)[number]));
		}
		return { ...payload, model: OPENROUTER_FREE_MODELS[openrouterIndex] };
	});

	pi.on("model_select", (event) => {
		activeProvider = event.model.provider;
		if (activeProvider === "openrouter" && event.model.id.endsWith(":free")) {
			openrouterIndex = Math.max(0, OPENROUTER_FREE_MODELS.indexOf(event.model.id as (typeof OPENROUTER_FREE_MODELS)[number]));
		}
	});

	pi.on("turn_end", async (event, ctx) => {
		const message = event.message;
		if (message.role !== "assistant" || message.stopReason !== "error") return;
		const error = message.errorMessage ?? "";
		if (activeProvider === "openrouter") {
			if (error.includes("free-models-per-day")) await switchToGroq(ctx);
			else if (openrouterIndex < OPENROUTER_FREE_MODELS.length - 1) openrouterIndex += 1;
		} else if (activeProvider === "groq-direct") {
			// Leave Groq selected after its own failures; no paid provider is configured.
		}
	});
}
