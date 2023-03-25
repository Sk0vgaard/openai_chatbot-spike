import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OpenaiService} from "../_services/openai.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userInput: string = '';
  answer: string | null = null;

  constructor(private openaiService: OpenaiService) {}

  async submitQuestion() {
    if (this.userInput) {
      this.answer = await this.openaiService.getAnswer(this.userInput);
    }
  }
}
