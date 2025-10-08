package backend.backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity  //this turn on spring security and allow to customize security

public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        //security filter chain is added to add extra rules for security in http request
        http.csrf(cutomizer ->cutomizer.disable());
        http.authorizeHttpRequests(request-> request.requestMatchers("/login").permitAll().anyRequest().authenticated()); //requires evervy user to be authenticated hence login
        http.formLogin(Customizer.withDefaults());
        http.httpBasic(Customizer.withDefaults());

        return http.build();
    }
   @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
       return  config.getAuthenticationManager();

   }
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("nikita")
                .password("{noop}niki") // no password encoder
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(user);
    }


}
