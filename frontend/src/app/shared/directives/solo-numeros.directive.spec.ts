import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SoloNumerosDirective } from './solo-numeros.directive';

@Component({
  imports: [ReactiveFormsModule, SoloNumerosDirective],
  template: `<input [formControl]="documento" appSoloNumeros />`,
})
class HostDePrueba {
  documento = new FormControl('');
}

describe('SoloNumerosDirective (appSoloNumeros)', () => {
  let fixture: ComponentFixture<HostDePrueba>;
  let input: HTMLInputElement;

  function escribir(texto: string): void {
    input.value = texto;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostDePrueba] });
    fixture = TestBed.createComponent(HostDePrueba);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('elimina letras y símbolos y deja solo dígitos', () => {
    escribir('70a00-000 1x');
    expect(input.value).toBe('70000001');
    expect(fixture.componentInstance.documento.value).toBe('70000001');
  });

  it('no modifica un valor que ya es numérico', () => {
    escribir('45678912');
    expect(fixture.componentInstance.documento.value).toBe('45678912');
  });

  it('activa el teclado numérico en celulares', () => {
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});
