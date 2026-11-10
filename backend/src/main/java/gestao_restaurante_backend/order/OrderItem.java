package gestao_restaurante_backend.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import gestao_restaurante_backend.product.Product;

@Entity
@Table(name = "customer_order_items")
public class OrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "order_id", nullable = false)
	private CustomerOrder order;

	@ManyToOne(optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@Column(nullable = false)
	private int quantity;

	@Column(nullable = false)
	private int unitPriceCents;

	protected OrderItem() {
	}

	public OrderItem(Product product, int quantity) {
		this.product = product;
		this.quantity = quantity;
		this.unitPriceCents = product.getPriceCents();
	}

	void setOrder(CustomerOrder order) {
		this.order = order;
	}

	public Long getProductId() {
		return product.getId();
	}

	public String getName() {
		return product.getName();
	}

	public int getQuantity() {
		return quantity;
	}

	public int getUnitPriceCents() {
		return unitPriceCents;
	}

	public long getSubtotalCents() {
		return (long) unitPriceCents * quantity;
	}
}
