package backend.backend.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
                // CORS config
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.setAllowedOrigins(List.of("http://localhost:5173"));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowCredentials(true);
                    corsConfig.setAllowedHeaders(List.of("*"));
                    return corsConfig;
                }))
                // Disable CSRF for APIs
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                "/api/login",
                                "/api/register",
                                "/api/google-signup",
                                "/api/forgetPassword",
                                "/api/verify-otp",
                                "/api/reset-password",
                                "/api/caregivers/**"
                        )
                )
                // Authorize requests
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()   // open your APIs
                        .anyRequest().authenticated()             // everything else needs login
                )
                // Form login
                .formLogin(form -> form
                        .loginProcessingUrl("/api/login")
                        .usernameParameter("userName")   // match your frontend
                        .passwordParameter("password")
                        .successHandler(customOtpSuccessHandler())
                        .permitAll()
                )
                // OAuth2 login
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .successHandler(customOtpSuccessHandler())
                )
                // Logout
                .logout(logout -> logout.permitAll());

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
