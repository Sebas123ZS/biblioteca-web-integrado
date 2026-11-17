package com.biblioteca.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Endpoint público y liviano para comprobar que el servidor está en línea.
 * Lo usa el monitor externo (cron-job.org / UptimeRobot) para que el
 * servicio gratuito de Render no se apague por inactividad.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public Map<String, Object> estado() {
        return Map.of("estado", "OK", "fecha", LocalDateTime.now().toString());
    }
}
