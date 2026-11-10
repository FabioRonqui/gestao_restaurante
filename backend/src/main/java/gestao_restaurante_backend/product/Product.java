package gestao_restaurante_backend.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_products")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private int priceCents;

	@Column(nullable = false, length = 1000)
	private String description;

	private String imageUrl;

	@Column(nullable = false)
	private String category;

	protected Product() {
	}

	public Product(String name, int priceCents, String description, String imageUrl, String category) {
		this.name = name;
		this.priceCents = priceCents;
		this.description = description;
		this.imageUrl = imageUrl;
		this.category = category;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public int getPriceCents() {
		return priceCents;
	}

	public String getDescription() {
		return description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public String getCategory() {
		return category;
	}
}
