import { Component } from '@angular/core';
import { MessagesComponent } from '../../components/messages/messages';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [MessagesComponent],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
})
export class MessagesPage {}
