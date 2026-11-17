import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { iniciarSesion } from '../../../testing/datos-prueba';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const URL_LIBROS = `${environment.apiUrl}/libros`;
  let httpClient: HttpClient;
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('agrega el encabezado Authorization: Bearer cuando hay sesión', () => {
    iniciarSesion(auth, http);

    httpClient.get(URL_LIBROS).subscribe();

    const req = http.expectOne(URL_LIBROS);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    req.flush({});
  });

  it('no agrega el encabezado si no hay sesión', () => {
    httpClient.get(URL_LIBROS).subscribe();

    const req = http.expectOne(URL_LIBROS);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('ante un 401 (token vencido) avisa al usuario y cierra la sesión', () => {
    iniciarSesion(auth, http);
    const logout = spyOn(auth, 'logout');
    const alerta = spyOn(TestBed.inject(ToastService), 'alerta');

    httpClient.get(URL_LIBROS).subscribe({ error: () => undefined });
    http.expectOne(URL_LIBROS).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logout).toHaveBeenCalled();
    expect(alerta).toHaveBeenCalled();
  });

  it('un 401 en el login (credenciales incorrectas) NO cierra la sesión', () => {
    const logout = spyOn(auth, 'logout');

    auth.login({ login: 'admin', password: 'mala' }).subscribe({ error: () => undefined });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logout).not.toHaveBeenCalled();
  });

  it('propaga el error al componente para que muestre el mensaje', () => {
    let estado = 0;
    httpClient.get(URL_LIBROS).subscribe({ error: (e) => (estado = e.status) });
    http.expectOne(URL_LIBROS).flush({ mensaje: 'Regla de negocio' }, { status: 409, statusText: 'Conflict' });

    expect(estado).toBe(409);
  });
});
