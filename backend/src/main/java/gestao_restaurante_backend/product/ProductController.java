package gestao_restaurante_backend.product;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

	private final ProductRepository products;

	public ProductController(ProductRepository products) {
		this.products = products;
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<ProductResponse> listProducts() {
		return products.findAll().stream()
				.map(product -> new ProductResponse(
						product.getId(),
						product.getName(),
						product.getPriceCents(),
						product.getDescription(),
						product.getImageUrl(),
						product.getCategoryName()))
				.toList();
	}

	public record ProductResponse(
			Integer id,
			String name,
			long priceCents,
			String description,
			String imageUrl,
			String category) {
	}
}
