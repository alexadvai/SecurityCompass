'use server';

/**
 * @fileOverview This file defines a Genkit flow for inferring potential security risks based on asset metadata.
 *
 * - inferPotentialRisk - A function that takes asset metadata as input and returns suggested relationships to other assets based on potential security risks.
 * - InferPotentialRiskInput - The input type for the inferPotentialRisk function.
 * - InferPotentialRiskOutput - The return type for the inferPotentialRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InferPotentialRiskInputSchema = z.object({
  assetMetadata: z.record(z.any()).describe('Metadata of the newly ingested asset.'),
  assetId: z.string().describe('The ID of the asset to analyze.'),
});
export type InferPotentialRiskInput = z.infer<typeof InferPotentialRiskInputSchema>;

const InferPotentialRiskOutputSchema = z.array(
  z.object({
    toAssetId: z.string().describe('The ID of the asset to which a relationship is suggested.'),
    relationshipType: z.string().describe('The type of relationship suggested (e.g., uses, connected_to, depends_on).'),
    riskScore: z.number().describe('A score between 0 and 1 indicating the risk associated with the suggested relationship.'),
    reason: z.string().describe('Reason why the relationship is suggested')
  })
).describe('An array of suggested relationships to other assets based on potential security risks.');

export type InferPotentialRiskOutput = z.infer<typeof InferPotentialRiskOutputSchema>;

export async function inferPotentialRisk(input: InferPotentialRiskInput): Promise<InferPotentialRiskOutput> {
  return inferPotentialRiskFlow(input);
}

const inferPotentialRiskPrompt = ai.definePrompt({
  name: 'inferPotentialRiskPrompt',
  input: {schema: InferPotentialRiskInputSchema},
  output: {schema: InferPotentialRiskOutputSchema},
  prompt: `You are a security expert analyzing cloud asset metadata to identify potential security risks and suggest relationships to other assets.

  Given the following asset metadata:
  {{json assetMetadata}}

  Suggest potential relationships (edges) to other assets that might indicate a security risk.  Include the asset ID of the related asset, the type of relationship (e.g., uses, connected_to, depends_on), a risk score (0 to 1) indicating the severity, and a reason for suggesting the relationship.

  Return the suggestions as a JSON array.
  `,
});

const inferPotentialRiskFlow = ai.defineFlow(
  {
    name: 'inferPotentialRiskFlow',
    inputSchema: InferPotentialRiskInputSchema,
    outputSchema: InferPotentialRiskOutputSchema,
  },
  async input => {
    const {output} = await inferPotentialRiskPrompt(input);
    return output!;
  }
);
