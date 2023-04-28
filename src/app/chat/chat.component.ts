import {AfterViewChecked, Component, ElementRef, ViewChild} from '@angular/core';
import { OpenaiService } from "../_services/openai.service";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatLegacyChipsModule} from "@angular/material/legacy-chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

export class Message {
  text: string;
  response: string;
  loading?: boolean;

  constructor(text: string, response: string, loading?: boolean) {
    this.text = text;
    this.response = response;
    this.loading = loading;
  }
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatLegacyChipsModule, MatProgressSpinnerModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer', { read: ElementRef }) messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput: string = '';

  constructor(private openaiService: OpenaiService) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  addMessage(event: Event) {
    if (this.userInput.trim() !== '') {
      const newMessage = new Message(this.userInput, '', true);
      this.messages.push(newMessage);
      this.generateText(newMessage);
      this.userInput = '';
    }
  }

  generateText(message: Message) {
    const prompts = this.messages.map((item: Message) => ({ role: ChatCompletionRequestMessageRoleEnum.User, content: item.text }));

    this.openaiService.createCompletion(prompts).then((text: string) => {
      message.response = text;
      message.loading = false;
    });
  }
}
