package gestao_restaurante_backend.product;

import java.util.List;

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
	public List<Product> listProducts() {
		return products.findAll();
	}
}
