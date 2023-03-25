import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OpenaiService} from "../_services/openai.service";
import {FormsModule} from "@angular/forms";

export class textResponse {
  sno: number = 1;
  text: string = '';
  response: any = '';
  loading?: boolean = false;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  textList: textResponse[] = [{sno: 1, text: '', response: ''}];

  constructor(private openaiService: OpenaiService) {
  }

  generateText(data: textResponse) {
    data.loading = true; // Set loading to true when starting the request
    this.openaiService.generateText(data.text).then(text => {
      data.response = text;
      data.loading = false; // Set loading to false when the request is complete
      if (this.textList.length === data.sno) {
        this.textList.push({sno: 1, text: '', response: ''});
      }
    });
  }
}
