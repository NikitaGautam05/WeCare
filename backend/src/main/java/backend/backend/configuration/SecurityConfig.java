package backend.backend.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.setAllowedOrigins(List.of("http://localhost:5173"));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowCredentials(true);
                    corsConfig.setAllowedHeaders(List.of("*"));
                    return corsConfig;
                }))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/forgetPassword",
                                "/api/verify-otp",
                                "/api/login",
                                "/api/register",
                                "/api/reset-password",
                                "/api/google-signup",
                                "/save",
                                "/login",
                                "/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                // Custom success handler for login to trigger OTP/email if needed
                .formLogin(form -> form
                        .loginPage("/login")
                        .successHandler(customOtpSuccessHandler()) // Call OTP/email logic here
                        .permitAll()
                )
                // OAuth2 login uses the same success handler
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .successHandler(customOtpSuccessHandler())
                )
                .logout(logout -> logout.permitAll());

        return http.build();
    }

    // Success handler to send OTP or trigger other actions after login
    @Bean
    public AuthenticationSuccessHandler customOtpSuccessHandler() {
        return (request, response, authentication) -> {
            String username = authentication.getName();
            System.out.println("Login success: " + username);
            // TODO: Call your OTP/email service here if needed
            // Example: otpService.sendOtp(username);

            // Redirect to dashboard
            response.sendRedirect("/dash");
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Uncomment for in-memory testing
    /*
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
