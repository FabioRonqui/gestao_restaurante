package gestao_restaurante_backend.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import gestao_restaurante_backend.product.Product;

@Entity
@Table(name = "itens_pedido")
public class OrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "id_pedido", nullable = false)
	private CustomerOrder order;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "id_produto", nullable = false)
	private Product product;

	@Column(name = "obs", length = 100)
	private String observation;

	@Column(name = "qtd", nullable = false)
	private int quantity;

	protected OrderItem() {
	}

	public OrderItem(Product product, int quantity) {
		this.product = product;
		this.quantity = quantity;
	}

	void setOrder(CustomerOrder order) {
		this.order = order;
	}

	public Integer getProductId() {
		return product.getId();
	}

	public String getName() {
		return product.getName();
	}

	public int getQuantity() {
		return quantity;
	}

	public long getUnitPriceCents() {
		return product.getPriceCents();
	}

	public long getSubtotalCents() {
		return getUnitPriceCents() * quantity;
	}
}
