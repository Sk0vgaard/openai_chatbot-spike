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
import {MatIconModule} from "@angular/material/icon";

export class MessageContent {
  type: 'text' | 'code';
  text: string;

  constructor(type: 'text' | 'code', text: string) {
    this.type = type;
    this.text = text;
  }
}

export class Message {
  text: string;
  response: MessageContent[];
  loading?: boolean;

  constructor(text: string, response: MessageContent[], loading?: boolean) {
    this.text = text;
    this.response = response;
    this.loading = loading;
  }
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatLegacyChipsModule, MatProgressSpinnerModule, MatIconModule],
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

  copyToClipboard(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  addMessage(event: Event) {
    if (this.userInput.trim() !== '') {
      const newMessage = new Message(this.userInput, [], true);
      this.messages.push(newMessage);
      this.generateText(newMessage);
      this.userInput = '';
    }
  }

  generateText(message: Message) {
    const prompts = this.messages.map((item: Message) => ({ role: ChatCompletionRequestMessageRoleEnum.User, content: item.text }));

    this.openaiService.createCompletion(prompts).then((text: string) => {
      const codeBlockRegex = /```([\s\S]*?)```/g;
      let match;
      let lastIndex = 0;
      const responseContent: MessageContent[] = [];

      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          responseContent.push(new MessageContent('text', text.slice(lastIndex, match.index).trim()));
        }
        responseContent.push(new MessageContent('code', match[1].trim()));
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        responseContent.push(new MessageContent('text', text.slice(lastIndex).trim()));
      }

      message.response = responseContent;
      message.loading = false;
    });
  }
}
