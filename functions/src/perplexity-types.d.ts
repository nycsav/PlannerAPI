/**
 * Type declaration shim for @perplexity-ai/perplexity_ai
 *
 * The published package is missing its root index.d.ts entry point.
 * This shim provides minimal typing so TypeScript can compile.
 */
declare module '@perplexity-ai/perplexity_ai' {
  class Perplexity {
    constructor(options: { apiKey: string; [key: string]: any });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chat: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    search: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses: any;
  }
  export default Perplexity;
}
