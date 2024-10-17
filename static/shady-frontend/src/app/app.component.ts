// src/app/app.component.ts

import {Component, signal, ViewChild} from '@angular/core';
import { ShaderRendererComponent } from './shader/renderer/shader-renderer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('renderer') renderer!: ShaderRendererComponent;
  code = signal<string>('');
  constructor() { }

  setCode(code: string): void {
    this.code.set(code);
  }
}
