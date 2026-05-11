package com.clinicalappointmentsystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int LIMIT = 120;
    private static final long WINDOW_SECONDS = 60;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String key = request.getRemoteAddr();
        Window window = windows.computeIfAbsent(key, ignored -> new Window());
        Instant now = Instant.now();

        synchronized (window) {
            if (now.isAfter(window.startedAt.plusSeconds(WINDOW_SECONDS))) {
                window.startedAt = now;
                window.count = 0;
            }
            window.count += 1;
            if (window.count > LIMIT) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Rate limit exceeded");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static final class Window {
        private Instant startedAt = Instant.now();
        private int count = 0;
    }
}
