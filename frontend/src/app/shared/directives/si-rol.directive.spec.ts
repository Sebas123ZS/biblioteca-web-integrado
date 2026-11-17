import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { iniciarSesion } from '../../../testing/datos-prueba';
import { AuthService } from '../../core/services/auth.service';
import { SiRolDirective } from './si-rol.directive';

@Component({
  imports: [SiRolDirective],
  template: `
    <button *appSiRol="'BIBLIOTECARIO'" id="solo-admin">Registrar libro</button>
    <span *appSiRol="['BIBLIOTECARIO', 'LECTOR']" id="todos">Catálogo</span>
  `,
})
class HostDePrueba {}

describe('SiRolDirective (*appSiRol)', () => {
  let fixture: ComponentFixture<HostDePrueba>;
  let auth: AuthService;
  let http: HttpTestingController;

  const existe = (id: string) => !!fixture.nativeElement.querySelector(`#${id}`);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HostDePrueba],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HostDePrueba);
  });

  afterEach(() => localStorage.clear());

  it('sin sesión no muestra contenido protegido', () => {
    fixture.detectChanges();
    expect(existe('solo-admin')).toBeFalse();
    expect(existe('todos')).toBeFalse();
  });

  it('el bibliotecario ve los botones de administración', () => {
    iniciarSesion(auth, http, 'BIBLIOTECARIO');
    fixture.detectChanges();
    expect(existe('solo-admin')).toBeTrue();
    expect(existe('todos')).toBeTrue();
  });

  it('el lector no ve los botones de administración', () => {
    iniciarSesion(auth, http, 'LECTOR');
    fixture.detectChanges();
    expect(existe('solo-admin')).toBeFalse();
    expect(existe('todos')).toBeTrue();
  });

  it('es reactiva: al cerrar sesión oculta el contenido', () => {
    iniciarSesion(auth, http, 'BIBLIOTECARIO');
    fixture.detectChanges();
    expect(existe('solo-admin')).toBeTrue();

    auth.logout();
    fixture.detectChanges();
    expect(existe('solo-admin')).toBeFalse();
  });
});
