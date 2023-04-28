import {Injectable} from '@angular/core';
import {Configuration, OpenAIApi} from "openai";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private openai: OpenAIApi;
  configuration = new Configuration({
    // TODO: Add your apikey. https://platform.openai.com/account/api-keys
    apiKey: environment.openAiApiKey,
  });

  constructor() {
    this.openai = new OpenAIApi(this.configuration);
  }

  generateText(prompt: string): Promise<string | undefined> {
    return this.openai.createCompletion({
      // Currently gpt-4 is not supported. Signup is available
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 256
    }).then(response => {
      return response.data.choices[0].text;
    }).catch(error => {
      return '';
    });
  }
}
