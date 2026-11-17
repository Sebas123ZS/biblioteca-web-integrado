import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Rol } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

/**
 * Directiva estructural propia para el control de acceso en la vista (RBAC).
 * Muestra el contenido solo si el usuario autenticado tiene alguno de los roles indicados.
 *
 * Uso:
 *   <button *appSiRol="'BIBLIOTECARIO'">Registrar libro</button>
 *   <div *appSiRol="['BIBLIOTECARIO', 'LECTOR']">...</div>
 *
 * Es reactiva: si cambia el usuario (login / logout) se vuelve a evaluar sola,
 * porque lee la señal "usuario" del AuthService dentro de un effect().
 * Complementa (no reemplaza) la seguridad del backend con @PreAuthorize.
 */
@Directive({
  selector: '[appSiRol]',
})
export class SiRolDirective {
  private auth = inject(AuthService);
  private template = inject(TemplateRef<unknown>);
  private contenedor = inject(ViewContainerRef);

  /** Rol o lista de roles permitidos. */
  readonly appSiRol = input.required<Rol | Rol[]>();

  private visible = false;

  constructor() {
    effect(() => {
      this.auth.usuario(); // dependencia reactiva: se reevalúa en login/logout
      const roles = this.appSiRol();
      const permitido = this.auth.tieneRol(...(Array.isArray(roles) ? roles : [roles]));

      if (permitido && !this.visible) {
        this.contenedor.createEmbeddedView(this.template);
        this.visible = true;
      } else if (!permitido && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}
