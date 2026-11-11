//Expõe as rotas (URLs) para abrir mesa,
//consultar consumo da sessão e fechar a conta.
package gestao_restaurante_backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import gestao_restaurante_backend.staff.StaffAuthService;
import gestao_restaurante_backend.staff.StaffRole;

@RestController
@RequestMapping("/api/tables")
public class MesaSessaoController {

	private final MesaSessaoService sessions;
	private final StaffAuthService staffAuth;

	public MesaSessaoController(MesaSessaoService sessions, StaffAuthService staffAuth) {
		this.sessions = sessions;
		this.staffAuth = staffAuth;
	}

	@GetMapping
	public MesaSessaoService.TableListResponse listTables() {
		return sessions.listTables();
	}

	@GetMapping("/{tableNumber}/availability")
	public AvailabilityResponse availability(
			@PathVariable @Min(1) int tableNumber,
			@RequestParam(required = false) String token) {
		boolean registered = sessions.isRegistered(tableNumber);
		return new AvailabilityResponse(registered, registered && sessions.isAvailable(tableNumber, token));
	}

	@PostMapping("/session")
	public MesaSessaoService.SessionResponse start(@Valid @RequestBody StartSessionRequest request) {
		return sessions.start(request.tableNumber(), request.token());
	}

	@PostMapping
	public MesaSessaoService.RegistrationResponse register(
			@RequestHeader("X-Staff-Token") String token,
			@Valid @RequestBody RegisterTableRequest request) {
		staffAuth.requireAtLeast(token, StaffRole.PLENO);
		return sessions.register(request.numero(), request.pessoas());
	}

	@DeleteMapping("/{tableNumber}/session")
	public ReleaseResponse release(
			@PathVariable @Min(1) int tableNumber,
			@RequestParam String token) {
		sessions.release(tableNumber, token);
		return new ReleaseResponse(true);
	}

	public record StartSessionRequest(
			@NotNull @Min(1) Integer tableNumber,
			String token) {
	}

	public record RegisterTableRequest(
			@NotNull @Min(1) Integer numero,
			@NotNull @Min(1) Integer pessoas) {
	}

	public record AvailabilityResponse(boolean registered, boolean available) {
	}

	public record ReleaseResponse(boolean released) {
	}
}
