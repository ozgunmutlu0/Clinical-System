package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.Role;
import com.clinicalappointmentsystem.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);

    boolean existsByEmailIgnoreCase(String email);
}
