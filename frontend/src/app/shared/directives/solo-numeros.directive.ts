import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directiva de atributo propia para formularios.
 * Impide escribir o pegar caracteres que no sean dígitos (DNI, código, etc.)
 * y mantiene sincronizado el valor del FormControl.
 *
 * Uso:
 *   <input formControlName="documento" appSoloNumeros />
 */
@Directive({
  selector: 'input[appSoloNumeros]',
  host: { inputmode: 'numeric' },
})
export class SoloNumerosDirective {
  private elemento = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private control = inject(NgControl, { optional: true, self: true });

  @HostListener('input')
  alEscribir(): void {
    const input = this.elemento.nativeElement;
    const limpio = input.value.replace(/\D+/g, '');
    if (limpio !== input.value) {
      input.value = limpio;
      this.control?.control?.setValue(limpio);
    }
  }
}
