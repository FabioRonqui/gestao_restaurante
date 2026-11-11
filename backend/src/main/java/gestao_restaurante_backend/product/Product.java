package gestao_restaurante_backend.product;

import java.math.BigDecimal;
import java.math.RoundingMode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "nome", nullable = false, length = 150)
	private String name;

	@Column(name = "valor", nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Column(name = "descricao", columnDefinition = "text")
	private String description;

	@Column(name = "imagem", length = 255)
	private String imageUrl;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "categoria_id")
	private ProductCategory category;

	protected Product() {
	}

	public Product(String name, long priceCents, String description, String imageUrl) {
		this.name = name;
		this.price = BigDecimal.valueOf(priceCents, 2);
		this.description = description;
		this.imageUrl = imageUrl;
	}

	public Integer getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public long getPriceCents() {
		return price.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

	public String getDescription() {
		return description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public String getCategoryName() {
		return category == null ? "" : category.getName();
	}
}
