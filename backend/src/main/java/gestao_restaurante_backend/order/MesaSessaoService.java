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

	private static final long SESSION_HOURS = 2;

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

	@Transactional(readOnly = true)
	public boolean isRegistered(int tableNumber) {
		return mesas.existsById(tableNumber);
	}

	@Transactional(readOnly = true)
	public boolean isAvailable(int tableNumber, String token) {
		return sessions.findById(tableNumber)
				.map(session -> !session.getExpiresAt().isAfter(LocalDateTime.now())
						|| session.getToken().equals(token))
				.orElse(true);
	}

	@Transactional(readOnly = true)
	public TableListResponse listTables() {
		List<MesaSessao> activeSessions = sessions.findAll().stream()
				.filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
				.toList();
		Set<Integer> occupiedTableNumbers = activeSessions.stream()
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

		if (session != null && session.getExpiresAt().isAfter(now)) {
			if (session.getToken().equals(existingToken)) {
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

	@Transactional(readOnly = true)
	public void requireActiveSession(int tableNumber, String token) {
		MesaSessao session = sessions.findById(tableNumber)
				.filter(current -> current.getExpiresAt().isAfter(LocalDateTime.now()))
				.filter(current -> current.getToken().equals(token))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.FORBIDDEN,
						"A sessão da mesa expirou ou foi encerrada. Volte ao início e selecione a mesa novamente."));
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
