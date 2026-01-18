import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Logo} from './shared/components/logo/logo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Logo],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TpEgaFront');
}
