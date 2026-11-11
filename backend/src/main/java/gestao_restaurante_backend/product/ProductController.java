package gestao_restaurante_backend.product;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import gestao_restaurante_backend.staff.StaffAuthService;
import gestao_restaurante_backend.staff.StaffRole;

@RestController
@RequestMapping("/api/products")
public class ProductController {

	private final ProductRepository products;
	private final StaffAuthService staffAuth;

	public ProductController(ProductRepository products, StaffAuthService staffAuth) {
		this.products = products;
		this.staffAuth = staffAuth;
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

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ProductResponse createProduct(
			@RequestHeader("X-Staff-Token") String token,
			@Valid @RequestBody ProductRequest request) {
		staffAuth.requireAtLeast(token, StaffRole.PLENO);
		Product product = products.save(new Product(
				request.name(), request.priceCents(), request.description(), request.imageUrl()));
		return ProductResponse.from(product);
	}

	@DeleteMapping("/{productId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Transactional
	public void deleteProduct(
			@RequestHeader("X-Staff-Token") String token,
			@PathVariable int productId) {
		staffAuth.requireAtLeast(token, StaffRole.GERENTE);
		if (!products.existsById(productId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado.");
		}
		products.deleteById(productId);
	}

	public record ProductRequest(
			@NotBlank @Size(max = 150) String name,
			@NotNull @Min(1) Long priceCents,
			String description,
			String imageUrl) {
	}

	public record ProductResponse(
			Integer id,
			String name,
			long priceCents,
			String description,
			String imageUrl,
			String category) {
		static ProductResponse from(Product product) {
			return new ProductResponse(
					product.getId(),
					product.getName(),
					product.getPriceCents(),
					product.getDescription(),
					product.getImageUrl(),
					product.getCategoryName());
		}
	}
}
