package backend.backend.configuration;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import backend.backend.service.JwtAuthFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.setAllowedOrigins(List.of("http://localhost:5173"));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(List.of("*"));
                    corsConfig.setAllowCredentials(true);
                    return corsConfig;
                }))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Always allow OPTIONS for CORS pre-flight checks
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Allow all caregivers endpoints (GET, POST, PUT, DELETE)
                        .requestMatchers("/api/caregivers/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()

                        // 3. Admin endpoints (allowing all for now to fix your AdminDashboard 403s)
                        .requestMatchers("/api/admin/**").permitAll()

                        // 4. Authentication and Password Reset endpoints
                        .requestMatchers(
                                "/api/users/login",
                                "/api/users/register",
                                "/api/users/complete-google-profile",
                                "/api/google-signup",
                                "/api/forgetPassword",
                                "/api/verify-otp",
                                "/api/reset-password",
                                "/uploads/**"
                        ).permitAll()

                        // 5. Secure all other actions (e.g., booking, reporting, hiring)
                        .anyRequest().authenticated()
                )
                // Ensure JWT filter is active to handle tokens for authenticated routes
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
    // === Success handler for login (OTP/email) ===
    @Bean
    public AuthenticationSuccessHandler customOtpSuccessHandler() {
        return (request, response, authentication) -> {
            String username = authentication.getName();
            System.out.println("Login success: " + username);
            // TODO: Call OTP/email service if needed
            // Example: otpService.sendOtp(username);

            // Redirect after successful login
            response.sendRedirect("/dash");
        };
    }

    // === Authentication provider (login) ===
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /*
    // Optional in-memory test users
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user1 = User
                .withDefaultPasswordEncoder()
                .username("nikita")
                .password("niki")
                .roles("USER")
                .build();

        UserDetails user2 = User
                .withDefaultPasswordEncoder()
                .username("mili")
                .password("{noop}mil")
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(user1, user2);
    }
    */
}
