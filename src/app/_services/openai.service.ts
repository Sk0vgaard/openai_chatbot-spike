import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiURL: string = 'https://api.openai.com/v1/engines/davinci-codex/completions';
  private apiKey: string = 'your_openai_api_key';

  constructor() {}

  async getAnswer(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiURL,
        {
          prompt: prompt,
          max_tokens: 50,
          n: 1,
          stop: null,
          temperature: 1.0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error fetching answer:', error);
      return 'An error occurred while fetching the answer.';
    }
  }
}
