// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ShaderEditorComponent } from './shader/editor/shader-editor.component';
import { ShaderRendererComponent } from './shader/renderer/shader-renderer.component';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    ShaderEditorComponent,
    ShaderRendererComponent
  ],
  imports: [
    BrowserModule,
    CommonModule, // Include if components use directives like ngIf, ngFor, etc.
    // Import other modules if necessary
  ],
  providers: [
    // Global providers here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
