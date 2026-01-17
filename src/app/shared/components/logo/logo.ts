import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrls: ['./logo.scss']
})
export class LogoComponent {
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
