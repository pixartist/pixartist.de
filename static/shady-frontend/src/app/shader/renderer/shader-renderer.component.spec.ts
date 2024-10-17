import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderRendererComponent } from './shader-renderer.component';

describe('ShaderRendererComponent', () => {
  let component: ShaderRendererComponent;
  let fixture: ComponentFixture<ShaderRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShaderRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShaderRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
