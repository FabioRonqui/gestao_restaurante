package gestao_restaurante_backend.order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedidos")
public class CustomerOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "num_mesa", nullable = false)
	private Mesa table;

	@Column(name = "status", nullable = false)
	private int statusCode;

	@Column(name = "data_criacao")
	private LocalDateTime createdAt;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private final List<OrderItem> items = new ArrayList<>();

	protected CustomerOrder() {
	}

	public CustomerOrder(Mesa table) {
		this.table = table;
		this.statusCode = 1;
		this.createdAt = LocalDateTime.now();
	}

	public void addItem(OrderItem item) {
		items.add(item);
		item.setOrder(this);
	}

	public Integer getId() {
		return id;
	}

	public int getTableNumber() {
		return table.getTableNumber();
	}

	public String getStatus() {
		return switch (statusCode) {
			case 0 -> "pending";
			case 1 -> "confirmed";
			case 2 -> "preparing";
			case 3 -> "out_for_delivery";
			case 4 -> "delivered";
			case 5 -> "cancelled";
			default -> throw new IllegalStateException("Status de pedido inválido no banco: " + statusCode);
		};
	}

	public long getTotalCents() {
		return items.stream().mapToLong(OrderItem::getSubtotalCents).sum();
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public List<OrderItem> getItems() {
		return items;
	}
}
