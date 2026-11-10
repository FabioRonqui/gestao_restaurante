package gestao_restaurante_backend.order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private int tableNumber;

	@Column(nullable = false)
	private String status;

	@Column(nullable = false)
	private long totalCents;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private final List<OrderItem> items = new ArrayList<>();

	protected CustomerOrder() {
	}

	public CustomerOrder(int tableNumber) {
		this.tableNumber = tableNumber;
		this.status = "confirmed";
		this.createdAt = LocalDateTime.now();
	}

	public void addItem(OrderItem item) {
		items.add(item);
		item.setOrder(this);
		totalCents += item.getSubtotalCents();
	}

	public Long getId() {
		return id;
	}

	public int getTableNumber() {
		return tableNumber;
	}

	public String getStatus() {
		return status;
	}

	public long getTotalCents() {
		return totalCents;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public List<OrderItem> getItems() {
		return items;
	}
}
