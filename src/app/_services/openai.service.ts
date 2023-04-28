import {Injectable} from '@angular/core';
import {ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi} from 'openai';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: environment.openAiApiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async createCompletion(prompts: Array<{ role: ChatCompletionRequestMessageRoleEnum; content: string }>): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        // use gpt-4 for more precise results
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: 'You are KirbyGPT a helpful assistant graphics design ChatBot, that helps with implementing the Kirby Design System for developers using Angular.'
          },
          ...prompts,
        ],
        temperature: 0,
        max_tokens: 250,
      });

      return response.data.choices[0].message?.content || 'No response from the API.';
    } catch (error) {
      console.error('Error while creating completion:', error);
      return 'Error while creating completion.' + error;
    }
  }
}
