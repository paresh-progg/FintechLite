'use server';

/**
 * @fileOverview A financial insights AI agent.
 *
 * - generateFinancialInsights - A function that handles the generation of financial insights.
 * - GenerateFinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - GenerateFinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialInsightsInputSchema = z.object({
  income: z
    .number()
    .describe('The total income of the user for the given period.'),
  expenses: z
    .array(z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount of the expense.'),
    }))
    .describe('The list of expenses of the user for the given period.'),
});
export type GenerateFinancialInsightsInput = z.infer<typeof GenerateFinancialInsightsInputSchema>;

const GenerateFinancialInsightsOutputSchema = z.object({
  insights: z.string().describe('The generated financial insights and recommendations.'),
});
export type GenerateFinancialInsightsOutput = z.infer<typeof GenerateFinancialInsightsOutputSchema>;

export async function generateFinancialInsights(input: GenerateFinancialInsightsInput): Promise<GenerateFinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightsPrompt',
  input: {schema: GenerateFinancialInsightsInputSchema},
  output: {schema: GenerateFinancialInsightsOutputSchema},
  prompt: `You are a personal financial advisor. Analyze the user's income and expenses and provide personalized insights and recommendations.

  Income: {{{income}}}
  Expenses:
  {{#each expenses}}
  - Category: {{category}}, Amount: {{amount}}
  {{/each}}
  \n  Provide actionable advice to improve their financial situation.
  Keep it short and sweet, no more than 5 sentences.
  Be encouraging.
  `,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: GenerateFinancialInsightsInputSchema,
    outputSchema: GenerateFinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
