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
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity  //this turn on spring security and allow to customize security

public class SecurityConfig {
    @Autowired
    private UserDetailsService userDetailsService;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors->{})
                .oauth2Login(Customizer.withDefaults())

        //security filter chain is added to add extra rules for security in http request
                .csrf(customizer ->customizer.disable());
        http.authorizeHttpRequests(request-> request.requestMatchers("/api/login","/api/register","/api/verify-otp","/save")
                .permitAll().anyRequest().authenticated()); //requires every user to be authenticated hence login

        http.formLogin(Customizer.withDefaults());
        http.httpBasic(Customizer.withDefaults())

        .formLogin(form->form
//                .loginPage("/login")
                . defaultSuccessUrl("/dash",true).permitAll()) //to navigate from login to dashboardc
                .logout(logout->logout.permitAll());


        return http.build();
    }
    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider=new DaoAuthenticationProvider();
        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
        provider.setUserDetailsService(userDetailsService);
        return provider;

    }
   @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
       return  config.getAuthenticationManager();

   }

//    @Bean
//    public UserDetailsService userDetailsService() {
//        UserDetails user1 = User
//                .withDefaultPasswordEncoder()
//                .username("nikita")
//                .password("niki") // no password encoder
//                .roles("USER")
//                .build();
//
//        UserDetails user2 =User
//                .withDefaultPasswordEncoder()
//                .username("mili")
//                .password("{noop}mil")
//                .roles("USER")
//                .build();
//
//        return new InMemoryUserDetailsManager(user1,user2);
//    }



}
