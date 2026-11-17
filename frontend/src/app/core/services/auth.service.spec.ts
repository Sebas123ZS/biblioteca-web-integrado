import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { iniciarSesion, respuestaLogin } from '../../../testing/datos-prueba';
import { AuthService } from './auth.service';

describe('AuthService', () => {
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

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sin sesión iniciada no está autenticado ni tiene token', () => {
    expect(auth.autenticado()).toBeFalse();
    expect(auth.token).toBeNull();
    expect(auth.usuario()).toBeNull();
  });

  it('login envía las credenciales por POST y guarda token y usuario', () => {
    auth.login({ login: 'admin', password: 'Admin123' }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'admin', password: 'Admin123' });
    req.flush(respuestaLogin('BIBLIOTECARIO'));

    expect(auth.autenticado()).toBeTrue();
    expect(auth.token).toBe('token-de-prueba');
    expect(auth.usuario()?.username).toBe('admin');
    expect(auth.esBibliotecario()).toBeTrue();
  });

  it('un token vencido se descarta y se cierra la sesión', () => {
    auth.login({ login: 'admin', password: 'Admin123' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(respuestaLogin('BIBLIOTECARIO', -1000));

    expect(auth.token).toBeNull();
    expect(auth.autenticado()).toBeFalse();
  });

  it('tieneRol y rutaInicio dependen del rol del usuario', () => {
    iniciarSesion(auth, http, 'LECTOR');

    expect(auth.tieneRol('LECTOR')).toBeTrue();
    expect(auth.tieneRol('BIBLIOTECARIO')).toBeFalse();
    expect(auth.rutaInicio()).toBe('/catalogo');
  });

  it('el bibliotecario inicia en el dashboard', () => {
    iniciarSesion(auth, http, 'BIBLIOTECARIO');
    expect(auth.rutaInicio()).toBe('/dashboard');
  });

  it('logout limpia el almacenamiento y redirige al login', () => {
    const router = TestBed.inject(Router);
    const navegar = spyOn(router, 'navigate').and.resolveTo(true);
    iniciarSesion(auth, http);

    auth.logout();

    expect(auth.autenticado()).toBeFalse();
    expect(localStorage.getItem('biblioteca_token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login']);
  });
});
