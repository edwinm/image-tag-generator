
// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview Generates alt text for images using AI.
 *
 * - generateAltText - A function that generates alt text for an image.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate alt text for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated alt text for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  return generateAltTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAltTextPrompt',
  input: {schema: GenerateAltTextInputSchema},
  output: {schema: GenerateAltTextOutputSchema},
  prompt: `You are an expert in generating alt text for images for accessibility and SEO purposes.

  Given the following image, generate descriptive alt text that is concise and informative.

  Image: {{media url=photoDataUri}}`,
});

const generateAltTextFlow = ai.defineFlow(
  {
    name: 'generateAltTextFlow',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async (input): Promise<GenerateAltTextOutput> => {
    try {
      const response = await prompt(input); // Returns Promise<GenerateResponse<GenerateAltTextOutput>>

      if (response.output && typeof response.output.altText === 'string') {
        // Even if altText is empty, it's a valid string response.
        // The UI handles empty alt text.
        return response.output;
      } else {
        console.warn(
          'Alt text generation by AI did not produce the expected output structure.',
          'Response output:', response.output,
          'Candidates:', response.candidates
        );
        // Check candidates for reasons like safety filtering
        if (response.candidates && response.candidates.length > 0) {
          response.candidates.forEach((candidate, index) => {
            console.warn(`Candidate ${index} finishReason: ${candidate.finishReason}, finishMessage: ${candidate.finishMessage}`);
          });
        }
        return { altText: '' }; // Default to empty alt text
      }
    } catch (error) {
      console.error('Error during generateAltTextFlow execution:', error);
      // Propagate a generic error or return a default value
      // Returning empty alt text allows the UI to handle it gracefully
      return { altText: '' };
    }
  }
);
