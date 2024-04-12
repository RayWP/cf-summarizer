/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	AI: Ai
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

import { Ai } from "@cloudflare/ai";



export default {

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const allowedMethods = 'GET, HEAD, POST, OPTIONS'
		const corsHeaders = {
		'Access-Control-Allow-Origin': env.FE_URL,
		'Access-Control-Allow-Methods': allowedMethods,
		'Access-Control-Allow-Headers': '*',
		}

		if (
			request.headers.get('Origin') !== null &&
			request.headers.get('Access-Control-Request-Method') !== null &&
			allowedMethods.includes(request.headers.get('Access-Control-Request-Method')) &&
			request.headers.get('Access-Control-Request-Headers') !== null
		  ) {
			console.log(1)
			// Handle CORS pre-flight request.
			return new Response(null, {
			  headers: corsHeaders,
			})
		}


		const formData = await request.formData();
		const file = await formData.get("file")
		const blob = await file.arrayBuffer();

		const ai = new Ai(env.AI);
		const input = {
		  audio: [...new Uint8Array(blob)],
		};
		let textResult = ""
		try {
			const audioToTextResponse = await ai.run(
				"@cf/openai/whisper",
				input
			  );

			  textResult = audioToTextResponse.text!
		} catch (e) {
			return new Response(JSON.stringify({
				error: e.message
			}), {
				status: 400,
				headers: corsHeaders
			})
		}


		const textSummarizeResponse = await ai.run(
			"@cf/facebook/bart-large-cnn",
			{
				input_text: textResult,
				max_length: 50
			}
		)

		const questionGeneratorResponse = await ai.run("@hf/thebloke/mistral-7b-instruct-v0.1-awq", {
			messages: [
				{ role: "system", content: "You are a teacher that give questions to students about custom topic"},
				{ role: "user", content: textSummarizeResponse.summary + "\n End of Article. Ask questions about the article."},
				{ role: "assistant", content: "output in json array of questions without number order"},
			]}
		);

		return new Response(JSON.stringify({
			"before": textResult,
			"after": textSummarizeResponse.summary,
			"questions": JSON.parse(questionGeneratorResponse.response)
		},),
		{
			headers: corsHeaders
		}
	)

	},
};
