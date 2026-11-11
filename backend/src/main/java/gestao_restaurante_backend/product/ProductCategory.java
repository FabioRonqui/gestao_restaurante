package gestao_restaurante_backend.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categorias")
public class ProductCategory {

	@Id
	private Integer id;

	@Column(name = "nome", nullable = false, length = 100)
	private String name;

	protected ProductCategory() {
	}

	public String getName() {
		return name;
	}
}
