//Arquivo de configurações web, 
//geralmente usado para liberar acesso externo (CORS)
// para o frontend, configurar interceptadores ou formatadores.

package gestao_restaurante_backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOriginPatterns("*")
				.allowedMethods("GET", "POST", "DELETE", "OPTIONS")
				.allowedHeaders("*");
	}
}
