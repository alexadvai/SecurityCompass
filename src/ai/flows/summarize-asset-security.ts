'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing the security posture of an asset.
 *
 * - summarizeAssetSecurity - A function that takes asset data and returns a natural language summary.
 * - SummarizeAssetSecurityInput - The input type for the summarizeAssetSecurity function.
 * - SummarizeAssetSecurityOutput - The return type for the summarizeAssetSecurity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAssetSecurityInputSchema = z.object({
  asset: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    metadata: z.record(z.any()),
    riskScore: z.number(),
    tags: z.array(z.string()),
  }),
});

export type SummarizeAssetSecurityInput = z.infer<typeof SummarizeAssetSecurityInputSchema>;

const SummarizeAssetSecurityOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, natural language summary of the asset\'s security posture, including its configuration and potential risks.'),
});

export type SummarizeAssetSecurityOutput = z.infer<typeof SummarizeAssetSecurityOutputSchema>;

export async function summarizeAssetSecurity(
  input: SummarizeAssetSecurityInput
): Promise<SummarizeAssetSecurityOutput> {
  return summarizeAssetSecurityFlow(input);
}

const summarizeAssetSecurityPrompt = ai.definePrompt({
  name: 'summarizeAssetSecurityPrompt',
  input: {schema: SummarizeAssetSecurityInputSchema},
  output: {schema: SummarizeAssetSecurityOutputSchema},
  prompt: `You are a principal security analyst. Your task is to provide a concise security summary for a given cloud asset.

Analyze the provided asset data and generate a 2-3 sentence summary covering:
1.  A brief description of the asset and its purpose.
2.  An assessment of its current security posture based on its configuration, tags, and risk score.
3.  Mention one key potential risk or misconfiguration if applicable.

Asset Data:
{{json asset}}

Generate the summary.`,
});

const summarizeAssetSecurityFlow = ai.defineFlow(
  {
    name: 'summarizeAssetSecurityFlow',
    inputSchema: SummarizeAssetSecurityInputSchema,
    outputSchema: SummarizeAssetSecurityOutputSchema,
  },
  async input => {
    const {output} = await summarizeAssetSecurityPrompt(input);
    return output!;
  }
);
