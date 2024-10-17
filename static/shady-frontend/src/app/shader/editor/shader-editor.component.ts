// src/app/shader-editor/shader-editor.component.ts

import {Component, EventEmitter, OnInit, Output, AfterViewInit, ViewChild, ElementRef, output} from '@angular/core';
import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike';
import exp from 'node:constants';

@Component({
  selector: 'app-shader-editor',
  templateUrl: './shader-editor.component.html',
  styleUrls: ['./shader-editor.component.scss']
})
export class ShaderEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef;

  private editor!: CodeMirror.EditorFromTextArea;

  isExpanded = true;
  code = output<string>();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.editor = CodeMirror.fromTextArea(this.editorElement.nativeElement, {
      lineNumbers: true,
      mode: 'x-shader/x-fragment',
      theme: 'default',
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: true,
    });

    // Emit changes with debounce
    let timeout: any;
    this.code.emit(this.editor.getValue());
    this.editor.on('change', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.code.emit(this.editor.getValue())
      }, 1000);
    });
  }

  // Method to set the editor content programmatically
  setContent(content: string): void {
    this.editor.setValue(content);
  }

  protected readonly exp = exp;
}
