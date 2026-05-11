package com.clinicalappointmentsystem.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class BruteForceProtectionService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_SECONDS = 900;

    private final Map<String, AttemptState> attempts = new ConcurrentHashMap<>();

    public void recordFailure(String key) {
        AttemptState state = attempts.computeIfAbsent(key, ignored -> new AttemptState());
        if (Instant.now().isAfter(state.blockedUntil)) {
            state.failures = 0;
        }
        state.failures += 1;
        if (state.failures >= MAX_ATTEMPTS) {
            state.blockedUntil = Instant.now().plusSeconds(BLOCK_SECONDS);
        }
    }

    public void clear(String key) {
        attempts.remove(key);
    }

    public boolean isBlocked(String key) {
        AttemptState state = attempts.get(key);
        return state != null && Instant.now().isBefore(state.blockedUntil);
    }

    private static final class AttemptState {
        private int failures = 0;
        private Instant blockedUntil = Instant.EPOCH;
    }
}
