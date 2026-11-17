import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { iniciarSesion } from '../../../testing/datos-prueba';
import { AuthService } from '../services/auth.service';
import { authGuard, invitadoGuard, rolGuard } from './auth.guards';

/** Ejecuta un guard funcional dentro del contexto de inyección de TestBed. */
function ejecutar(guard: typeof authGuard, data: Record<string, unknown> = {}) {
  const ruta = { data } as unknown as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => guard(ruta, {} as RouterStateSnapshot));
}

function rutaDestino(resultado: unknown): string {
  return TestBed.inject(Router).serializeUrl(resultado as UrlTree);
}

describe('Guards de rutas', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => localStorage.clear());

  describe('authGuard', () => {
    it('sin sesión redirige a /login', () => {
      const resultado = ejecutar(authGuard);
      expect(resultado).toBeInstanceOf(UrlTree);
      expect(rutaDestino(resultado)).toBe('/login');
    });

    it('con sesión permite el acceso', () => {
      iniciarSesion(auth, http);
      expect(ejecutar(authGuard)).toBeTrue();
    });
  });

  describe('invitadoGuard', () => {
    it('sin sesión permite ver el login', () => {
      expect(ejecutar(invitadoGuard)).toBeTrue();
    });

    it('con sesión envía al inicio según el rol', () => {
      iniciarSesion(auth, http, 'LECTOR');
      expect(rutaDestino(ejecutar(invitadoGuard))).toBe('/catalogo');
    });
  });

  describe('rolGuard (RBAC)', () => {
    const SOLO_BIBLIOTECARIO = { roles: ['BIBLIOTECARIO'] };

    it('el bibliotecario accede a rutas de administración', () => {
      iniciarSesion(auth, http, 'BIBLIOTECARIO');
      expect(ejecutar(rolGuard, SOLO_BIBLIOTECARIO)).toBeTrue();
    });

    it('el lector es redirigido al catálogo si intenta entrar a una ruta del bibliotecario', () => {
      iniciarSesion(auth, http, 'LECTOR');
      const resultado = ejecutar(rolGuard, SOLO_BIBLIOTECARIO);
      expect(resultado).toBeInstanceOf(UrlTree);
      expect(rutaDestino(resultado)).toBe('/catalogo');
    });

    it('una ruta sin roles definidos queda abierta para cualquier usuario autenticado', () => {
      iniciarSesion(auth, http, 'LECTOR');
      expect(ejecutar(rolGuard)).toBeTrue();
    });
  });
});
