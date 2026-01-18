import { Component, Input } from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-logo',
  //ca veut dire que le composant est independant et donc pas need de module
  standalone: true,
  //avec le commonModule c'est qu'on importe ce dont a on besoin
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <div
        [class]="'bg-teal-600 rounded-lg flex items-center justify-center text-white ' + sizeClasses">
        <svg [class]="iconSizeClass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 3h18v18H3z"/>
          <path d="M3 9h18M9 3v18"/>
        </svg>
      </div>
      <span
        *ngIf="variant === 'full'"
        [class]="'font-bold text-gray-900 ' + textSizeClass">
        EgaBank
      </span>
    </div>
  `,
  styles: []
})
export class Logo {

  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'icon' | 'full' = 'full';

  get sizeClasses(): string {
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    return sizes[this.size];
  }

  get iconSizeClass(): string {
    const iconSizes = {
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-7 h-7'
    };
    return iconSizes[this.size];
  }

  get textSizeClass(): string {
    const textSizes = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl'
    };
    return textSizes[this.size];
  }

}
