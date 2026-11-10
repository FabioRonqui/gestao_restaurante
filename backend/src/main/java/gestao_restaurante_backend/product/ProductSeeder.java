package gestao_restaurante_backend.product;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProductSeeder {

	@Bean
	ApplicationRunner seedProducts(ProductRepository products) {
		return args -> {
			if (products.count() == 0) {
				products.saveAll(List.of(
						new Product("Hambúrguer Clássico", 2590,
								"Pão macio, hambúrguer bovino, queijo, alface, tomate e molho da casa.",
								"https://picsum.photos/seed/hamburguer/160", "Lanches"),
						new Product("Batata Frita", 990,
								"Porção de batatas fritas crocantes com sal.",
								"https://picsum.photos/seed/batata/160", "Acompanhamentos"),
						new Product("Pizza Margherita", 4590,
								"Molho de tomate, muçarela, manjericão fresco e azeite.",
								"https://picsum.photos/seed/pizza/160", "Pizzas"),
						new Product("Salada de Frango", 2890,
								"Mix de folhas, frango grelhado, tomate cereja e molho de mostarda e mel.",
								"https://picsum.photos/seed/salada/160", "Saladas"),
						new Product("Suco de Laranja", 890,
								"Suco de laranja natural, 400 ml.", null, "Bebidas"),
						new Product("Brownie de Chocolate", 1290,
								"Brownie de chocolate meio amargo servido com sorvete de creme.",
								"https://picsum.photos/seed/brownie/160", "Sobremesas")));
			}
		};
	}
}
