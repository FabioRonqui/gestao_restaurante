//•  Expõe as rotas para criar novos pedidos, 
//   adicionar itens ou alterar o status do preparo.

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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import gestao_restaurante_backend.product.Product;
import gestao_restaurante_backend.product.ProductRepository;
import gestao_restaurante_backend.staff.StaffAuthService;
import gestao_restaurante_backend.staff.StaffRole;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderRepository orders;
	private final MesaRepository mesas;
	private final MesaSessaoService tableSessions;
	private final ProductRepository products;
	private final StaffAuthService staffAuth;

	public OrderController(
			OrderRepository orders,
			MesaRepository mesas,
			MesaSessaoService tableSessions,
			ProductRepository products,
			StaffAuthService staffAuth) {
		this.orders = orders;
		this.mesas = mesas;
		this.tableSessions = tableSessions;
		this.products = products;
		this.staffAuth = staffAuth;
	}

	@GetMapping("/staff/pending")
	@Transactional(readOnly = true)
	public List<OrderResponse> listPendingOrders(@RequestHeader("X-Staff-Token") String token) {
		staffAuth.require(token);
		return orders.findAllByStatusCodeOrderByCreatedAtDesc(0).stream()
				.map(OrderResponse::from)
				.toList();
	}

	@PatchMapping("/{orderId}/payment")
	@Transactional
	public OrderResponse confirmPayment(
			@RequestHeader("X-Staff-Token") String token,
			@PathVariable int orderId) {
		staffAuth.requireAtLeast(token, StaffRole.PLENO);
		CustomerOrder order = orders.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
		try {
			order.confirmPayment();
		} catch (IllegalStateException error) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, error.getMessage());
		}
		orders.flush();
		tableSessions.releaseIfNoRecentPendingOrders(order.getTableNumber());
		return OrderResponse.from(order);
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<OrderResponse> listOrders(
			@RequestParam @Min(1) int tableNumber,
			@RequestParam String sessionToken) {
		tableSessions.requireActiveSession(tableNumber, sessionToken);
		return orders.findAllByTable_TableNumberOrderByCreatedAtDesc(tableNumber).stream()
				.map(OrderResponse::from)
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Transactional
	public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
		tableSessions.requireActiveSession(request.tableNumber(), request.sessionToken());
		Mesa table = mesas.findById(request.tableNumber())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND, "Mesa não encontrada: " + request.tableNumber()));
		CustomerOrder order = new CustomerOrder(table);
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
			@NotNull String sessionToken,
			@NotEmpty List<@Valid CreateOrderItemRequest> items) {
	}

	public record CreateOrderItemRequest(
			@NotNull @Min(1) Integer productId,
			@NotNull @Min(1) Integer quantity) {
	}

	public record OrderResponse(
			Integer id,
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
			Integer productId,
			String name,
			String description,
			int quantity,
			long unitPriceCents,
			long subtotalCents) {
		static OrderItemResponse from(OrderItem item) {
			return new OrderItemResponse(
					item.getProductId(),
					item.getName(),
					item.getDescription(),
					item.getQuantity(),
					item.getUnitPriceCents(),
					item.getSubtotalCents());
		}
	}
}
