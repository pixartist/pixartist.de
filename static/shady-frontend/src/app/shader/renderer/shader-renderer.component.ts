// src/app/shader-renderer/shader-renderer.component.ts

import {Component, ElementRef, ViewChild, OnDestroy, input, computed} from '@angular/core';
import {lastValueDelayed} from '../../../lib/signals';

@Component({
  selector: 'app-shader-renderer',
  templateUrl: './shader-renderer.component.html',
  styleUrls: ['./shader-renderer.component.scss']
})
export class ShaderRendererComponent implements OnDestroy {
  @ViewChild('glCanvas') glCanvas!: ElementRef<HTMLCanvasElement>;
  code = input<string>();
  lastError = computed(() => this.updateFragmentShader(this.code() || ''));

  private animationFrameId: number = 0;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private canvas: HTMLCanvasElement | null = null;

  // Uniform locations
  private resolutionLocation: WebGLUniformLocation | null = null;
  private timeLocation: WebGLUniformLocation | null = null;

  constructor() { }

  ngAfterViewInit(): void {
    this.initialize(this.glCanvas.nativeElement);
    this.animationFrameId = requestAnimationFrame((time) => this.render(time));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl');

    if (!this.gl) {
      alert('WebGL not supported in your browser.');
      throw new Error('WebGL not supported');
    }

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize shader with default vertex and fragment shaders
    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
          gl_Position = a_position;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;
          gl_FragColor = vec4(st.x, st.y, abs(sin(u_time)), 1.0);
      }
    `;

    this.createProgram(vertexShaderSource, fragmentShaderSource);
    this.setupBuffers();
  }

  updateFragmentShader(source: string): string | null {
    if (!this.gl) return 'WebGL not initialized.';

    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
          gl_Position = a_position;
      }
    `;

    const newProgram = this.createProgram(vertexShaderSource, source);

    if (typeof newProgram === 'string') {
      // Compilation error
      return newProgram;
    } else {
      // Successful compilation
      this.program = newProgram;
      this.gl.useProgram(this.program);
      this.setupBuffers();
      return null;
    }
  }

  render(time: number): void {
    if (!this.gl || !this.program) return;

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update uniforms
    if (this.resolutionLocation && this.timeLocation) {
      this.gl.uniform2f(this.resolutionLocation, this.canvas!.width, this.canvas!.height);
      this.gl.uniform1f(this.timeLocation, time * 0.001); // Convert to seconds
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.animationFrameId = requestAnimationFrame((t) => this.render(t));
  }

  private resizeCanvas(): void {
    if (!this.gl || !this.canvas) return;

    const displayWidth = this.canvas.clientWidth * window.devicePixelRatio;
    const displayHeight = this.canvas.clientHeight * window.devicePixelRatio;

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | string {
    if (!this.gl) return 'WebGL not initialized.';

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    if (typeof vertexShader === 'string') return vertexShader;

    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    if (typeof fragmentShader === 'string') return fragmentShader;

    const program = this.gl.createProgram();
    if (!program) return 'Failed to create WebGL program.';

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!success) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      return `Program failed to link: ${info}`;
    }

    this.program = program;
    this.gl.useProgram(this.program);

    // Get uniform locations
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');

    return program;
  }

  private compileShader(type: number, source: string): WebGLShader | string {
    if (!this.gl) return 'WebGL not initialized.';

    const shader = this.gl.createShader(type);
    if (!shader) return 'Failed to create shader.';

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      return `Shader failed to compile: ${info}`;
    }

    return shader;
  }

  private setupBuffers(): void {
    if (!this.gl || !this.program) return;

    // Create a buffer for the quad
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // Fullscreen quad (two triangles)
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1,  1,
      -1,  1,
      1, -1,
      1,  1,
    ]);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Bind the position buffer
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
}
