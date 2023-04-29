import {Component, ElementRef, ViewChild} from '@angular/core';
import {OpenaiService} from "../_services/openai.service";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatLegacyChipsModule} from "@angular/material/legacy-chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltip, MatTooltipModule} from "@angular/material/tooltip";

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
  imports: [CommonModule, FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatLegacyChipsModule, MatProgressSpinnerModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @ViewChild('messagesContainer', {read: ElementRef}) messagesContainer!: ElementRef;

  public messages: Message[] = [];
  public userInput: string = '';
  private knownHeaders = ['html', 'typescript', 'scss', 'css'];


  constructor(private openaiService: OpenaiService) {
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  copyToClipboard(text: string) {
    const lines = text.split('\n');
    if (this.knownHeaders.includes(lines[0].trim())) {
      lines.shift();
      text = lines.join('\n');
    }

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
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  generateText(message: Message) {
    const prompts = this.messages.map((item: Message) => ({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: item.text
    }));

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

  getCodeHeader(text: string): string | null {
    const lines = text.split('\n');
    const firstLine = lines[0].trim();

    return this.knownHeaders.includes(firstLine) ? firstLine : null;
  }

  removeCodeHeader(text: string): string {
    const header = this.getCodeHeader(text);
    if (header) {
      const lines = text.split('\n');
      lines.shift();
      return lines.join('\n');
    }

    return text;
  }

  showCopiedTooltip(tooltip: MatTooltip) {
    tooltip.disabled = true;
    tooltip.message = 'Copied';
    tooltip.show();
    setTimeout(() => {
      tooltip.hide();
      tooltip.message = 'Copy to clipboard';
      tooltip.disabled = false;
    }, 4500);
  }

}
