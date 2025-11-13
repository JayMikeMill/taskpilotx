import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
