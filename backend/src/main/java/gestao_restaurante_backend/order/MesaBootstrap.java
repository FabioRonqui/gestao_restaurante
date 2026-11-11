package gestao_restaurante_backend.order;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MesaBootstrap {

	private static final List<Mesa> DEFAULT_TABLES = List.of(
			new Mesa(1, 2),
			new Mesa(2, 4),
			new Mesa(3, 4),
			new Mesa(4, 6),
			new Mesa(5, 2),
			new Mesa(6, 8),
			new Mesa(7, 4),
			new Mesa(8, 6),
			new Mesa(9, 2),
			new Mesa(10, 10),
			new Mesa(11, 4),
			new Mesa(12, 2),
			new Mesa(13, 6),
			new Mesa(14, 4),
			new Mesa(15, 8),
			new Mesa(16, 2));

	@Bean
	ApplicationRunner seedDefaultTables(MesaRepository tables) {
		return args -> DEFAULT_TABLES.stream()
				.filter(table -> !tables.existsById(table.getTableNumber()))
				.forEach(tables::save);
	}
}
