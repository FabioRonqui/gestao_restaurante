package gestao_restaurante_backend.order;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import gestao_restaurante_backend.product.Product;
import gestao_restaurante_backend.product.ProductRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderRepository orders;
	private final ProductRepository products;

	public OrderController(OrderRepository orders, ProductRepository products) {
		this.orders = orders;
		this.products = products;
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<OrderResponse> listOrders() {
		return orders.findAllByOrderByCreatedAtDesc().stream()
				.map(OrderResponse::from)
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Transactional
	public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
		CustomerOrder order = new CustomerOrder(request.tableNumber());
		for (CreateOrderItemRequest itemRequest : request.items()) {
			Product product = products.findById(itemRequest.productId())
					.orElseThrow(() -> new ResponseStatusException(
							HttpStatus.NOT_FOUND, "Produto não encontrado: " + itemRequest.productId()));
			order.addItem(new OrderItem(product, itemRequest.quantity()));
		}
		return OrderResponse.from(orders.save(order));
	}

	public record CreateOrderRequest(
			@NotNull @Min(1) Integer tableNumber,
			@NotEmpty List<@Valid CreateOrderItemRequest> items) {
	}

	public record CreateOrderItemRequest(
			@NotNull Long productId,
			@NotNull @Min(1) Integer quantity) {
	}

	public record OrderResponse(
			Long id,
			int tableNumber,
			String status,
			long totalCents,
			LocalDateTime createdAt,
			List<OrderItemResponse> items) {
		static OrderResponse from(CustomerOrder order) {
			return new OrderResponse(
					order.getId(),
					order.getTableNumber(),
					order.getStatus(),
					order.getTotalCents(),
					order.getCreatedAt(),
					order.getItems().stream().map(OrderItemResponse::from).toList());
		}
	}

	public record OrderItemResponse(
			Long productId,
			String name,
			int quantity,
			int unitPriceCents,
			long subtotalCents) {
		static OrderItemResponse from(OrderItem item) {
			return new OrderItemResponse(
					item.getProductId(),
					item.getName(),
					item.getQuantity(),
					item.getUnitPriceCents(),
					item.getSubtotalCents());
		}
	}
}
