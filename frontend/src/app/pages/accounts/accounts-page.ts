import { Component } from '@angular/core';
import { LinkedAccountsComponent } from '../../components/linked-accounts/linked-accounts.component';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [LinkedAccountsComponent],
  templateUrl: './accounts-page.html',
  styleUrl: './accounts-page.scss',
})
export class AccountsPage {}
