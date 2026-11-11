//A maioria dos projetos backend em java tem um service que 
//é responsável por implementar a lógica de negócio da aplicação.

package gestao_restaurante_backend.order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MesaSessaoService {

	static final long SESSION_HOURS = 2;

	private final MesaRepository mesas;
	private final MesaSessaoRepository sessions;
	private final OrderRepository orders;

	public MesaSessaoService(
			MesaRepository mesas,
			MesaSessaoRepository sessions,
			OrderRepository orders) {
		this.mesas = mesas;
		this.sessions = sessions;
		this.orders = orders;
	}
	// A reserva e os pedidos pendentes mantêm a mesa ocupada por até duas horas
	// sem atividade; a confirmação do pagamento ou a saída libera a mesa antes.

	@Transactional(readOnly = true)
	public boolean isRegistered(int tableNumber) {
		return mesas.existsById(tableNumber);
	}

	@Transactional(readOnly = true)
	public boolean isAvailable(int tableNumber, String token) {
		LocalDateTime now = LocalDateTime.now();
		return sessions.findById(tableNumber)
				.map(session -> session.getToken().equals(token) || !isOccupied(session, now))
				.orElse(true);
	}

	@Transactional(readOnly = true)
	public TableListResponse listTables() {
		LocalDateTime now = LocalDateTime.now();
		Set<Integer> occupiedTableNumbers = sessions.findAll().stream()
				.filter(session -> isOccupied(session, now))
				.map(MesaSessao::getTableNumber)
				.collect(Collectors.toSet());
		List<TableResponse> tableList = mesas.findAllByOrderByTableNumberAsc().stream()
				.map(table -> new TableResponse(
						table.getTableNumber(),
						table.getPeopleCount(),
						occupiedTableNumbers.contains(table.getTableNumber()) ? "ocupada" : "livre"))
				.toList();
		return new TableListResponse(tableList.size(), tableList);
	}

	@Transactional
	public RegistrationResponse register(int tableNumber, int peopleCount) {
		boolean registered = mesas.insertIfAbsent(tableNumber, peopleCount) == 1;
		return new RegistrationResponse(registered, tableNumber);
	}

	@Transactional
	public SessionResponse start(int tableNumber, String existingToken) {
		Mesa table = mesas.findByIdForUpdate(tableNumber)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"Mesa não cadastrada. Cadastre a mesa antes de iniciar o pedido."));
		LocalDateTime now = LocalDateTime.now();
		MesaSessao session = sessions.findByTableNumberForUpdate(tableNumber).orElse(null);

		if (session != null && isOccupied(session, now)) {
			if (session.getToken().equals(existingToken)) {
				if (!session.getExpiresAt().isAfter(now)) {
					session.renew(existingToken, now.plusHours(SESSION_HOURS));
				}
				return new SessionResponse(tableNumber, session.getToken(), session.getExpiresAt());
			}
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"Infelizmente essa mesa nao esta disponivel, Tente outro numero");
		}

		String token = UUID.randomUUID().toString();
		LocalDateTime expiresAt = now.plusHours(SESSION_HOURS);
		if (session == null) {
			sessions.save(new MesaSessao(table.getTableNumber(), token, expiresAt));
		} else {
			session.renew(token, expiresAt);
		}

		orders.deleteAll(orders.findAllByTable_TableNumber(tableNumber));
		return new SessionResponse(tableNumber, token, expiresAt);
	}

	@Transactional
	public void release(int tableNumber, String token) {
		MesaSessao session = sessions.findByIdForUpdate(tableNumber).orElse(null);
		if (session == null) {
			return;
		}
		if (!session.getToken().equals(token)) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"A sessão da mesa pertence a outra pessoa e não pode ser liberada por este acesso.");
		}
		sessions.delete(session);
	}

	@Transactional
	public void requireActiveSession(int tableNumber, String token) {
		LocalDateTime now = LocalDateTime.now();
		MesaSessao session = sessions.findByTableNumberForUpdate(tableNumber)
				.filter(current -> current.getToken().equals(token))
				.filter(current -> current.getExpiresAt().isAfter(now)
						|| orders.existsByTable_TableNumberAndStatusCodeAndCreatedAtAfter(
								tableNumber, 0, now.minusHours(SESSION_HOURS)))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.FORBIDDEN,
						"A sessão da mesa expirou ou foi encerrada. Volte ao início e selecione a mesa novamente."));
		session.renew(token, now.plusHours(SESSION_HOURS));
	}

	@Transactional
	public void releaseIfNoRecentPendingOrders(int tableNumber) {
		LocalDateTime activityCutoff = LocalDateTime.now().minusHours(SESSION_HOURS);
		boolean hasRecentPendingOrder = orders.existsByTable_TableNumberAndStatusCodeAndCreatedAtAfter(
				tableNumber, 0, activityCutoff);
		if (!hasRecentPendingOrder) {
			sessions.findByTableNumberForUpdate(tableNumber).ifPresent(sessions::delete);
		}
	}

	private boolean isOccupied(MesaSessao session, LocalDateTime now) {
		if (session.getExpiresAt().isAfter(now)) {
			return true;
		}
		return orders.existsByTable_TableNumberAndStatusCodeAndCreatedAtAfter(
				session.getTableNumber(), 0, now.minusHours(SESSION_HOURS));
	}

	public record SessionResponse(int tableNumber, String token, LocalDateTime expiresAt) {
	}

	public record TableResponse(int numero, int pessoas, String status) {
	}

	public record TableListResponse(int totalMesas, List<TableResponse> mesas) {
	}

	public record RegistrationResponse(boolean cadastrada, int numero) {
	}
}
