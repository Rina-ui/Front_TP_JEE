import { Component, Input } from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-logo',
  //ca veut dire que le composant est independant et donc pas need de module
  standalone: true,
  //avec le commonModule c'est qu'on importe ce dont a on besoin
  imports: [CommonModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {

  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'full' | 'icon' = 'full';

  get sizeClasses(): string {
    const sizes = {
      sm: 'w-8 h-8 text-lg',
      md: 'w-10 h-10 text-2xl',
      lg: 'w-14 h-14 text-3xl'
    };
    return sizes[this.size];
  }

  get textSizeClasses(): string {
    const sizes = {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-4xl'
    };
    return sizes[this.size];
  }

}
