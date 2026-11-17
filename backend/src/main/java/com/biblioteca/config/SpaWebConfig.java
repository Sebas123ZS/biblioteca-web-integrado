package com.biblioteca.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Permite que el mismo .jar sirva la interfaz Angular (versión "ejecutable").
 *
 * - Si la ruta corresponde a un archivo de la carpeta static (js, css, imágenes), lo devuelve.
 * - Si es una ruta de Angular (/libros, /prestamos...), devuelve index.html y el router
 *   de Angular se encarga de mostrar la página correcta.
 * - Las rutas /api/** nunca se redirigen: siguen siendo atendidas por los controladores REST.
 *
 * Cuando el backend se despliega solo (sin la carpeta static), esta configuración no tiene efecto.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    private static final String UBICACION = "classpath:/static/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(UBICACION)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String ruta, Resource ubicacion) throws IOException {
                        Resource solicitado = ubicacion.createRelative(ruta);
                        if (solicitado.exists() && solicitado.isReadable()) {
                            return solicitado;
                        }
                        if (ruta.startsWith("api/") || ruta.contains(".")) {
                            return null; // API inexistente o archivo faltante: 404 normal
                        }
                        Resource index = new ClassPathResource("/static/index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
