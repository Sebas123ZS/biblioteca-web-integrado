import { HttpTestingController } from '@angular/common/http/testing';
import { LoginResponse, Rol, Usuario } from '../app/core/models/models';
import { AuthService } from '../app/core/services/auth.service';
import { environment } from '../environments/environment';

/** Datos de prueba reutilizables para las pruebas unitarias del frontend. */
export function usuarioDePrueba(rol: Rol = 'BIBLIOTECARIO'): Usuario {
  return {
    id: 1,
    codigo: 'U-0001',
    nombres: 'María',
    apellidos: 'Torres Quispe',
    nombreCompleto: 'María Torres Quispe',
    documento: '70000001',
    correo: 'admin@biblioteca.pe',
    telefono: '987654321',
    direccion: 'Jr. Ica 245, Huancayo',
    username: rol === 'BIBLIOTECARIO' ? 'admin' : 'jperez',
    rol,
    estado: 'ACTIVO',
    fechaRegistro: '2026-11-01T10:00:00',
  };
}

export function respuestaLogin(rol: Rol = 'BIBLIOTECARIO', expiraEn = 60 * 60 * 1000): LoginResponse {
  return { token: 'token-de-prueba', tipo: 'Bearer', expiraEn, usuario: usuarioDePrueba(rol) };
}

/** Simula un inicio de sesión exitoso respondiendo la petición HTTP del login. */
export function iniciarSesion(auth: AuthService, http: HttpTestingController, rol: Rol = 'BIBLIOTECARIO'): void {
  auth.login({ login: 'admin', password: 'Admin123' }).subscribe();
  http.expectOne(`${environment.apiUrl}/auth/login`).flush(respuestaLogin(rol));
}
