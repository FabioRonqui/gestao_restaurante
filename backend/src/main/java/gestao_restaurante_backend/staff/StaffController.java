package gestao_restaurante_backend.staff;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

	private final StaffAuthService auth;
	private final StaffRepository staff;

	public StaffController(StaffAuthService auth, StaffRepository staff) {
		this.auth = auth;
		this.staff = staff;
	}

	@PostMapping("/login")
	public StaffAuthService.LoginResponse login(@Valid @RequestBody LoginRequest request) {
		return auth.login(request.registrationNumber(), request.password());
	}

	@GetMapping("/session")
	public StaffAuthService.LoginResponse session(@RequestHeader("X-Staff-Token") String token) {
		return auth.getSession(token);
	}

	@DeleteMapping("/session")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout(@RequestHeader("X-Staff-Token") String token) {
		auth.logout(token);
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<StaffResponse> list(@RequestHeader("X-Staff-Token") String token) {
		auth.requireAtLeast(token, StaffRole.GERENTE);
		return staff.findAll().stream()
				.map(member -> new StaffResponse(
						member.getRegistrationNumber(), member.getName(), member.getRole()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public StaffResponse create(
			@RequestHeader("X-Staff-Token") String token,
			@Valid @RequestBody CreateStaffRequest request) {
		auth.requireAtLeast(token, StaffRole.GERENTE);
		StaffMember member = auth.addStaff(request.registrationNumber(), request.name(), request.password());
		return new StaffResponse(member.getRegistrationNumber(), member.getName(), member.getRole());
	}

	public record LoginRequest(
			@NotBlank @Pattern(regexp = "\\d{5,6}") String registrationNumber,
			@NotBlank String password) {
	}

	public record CreateStaffRequest(
			@NotBlank @Pattern(regexp = "\\d{6}") String registrationNumber,
			@NotBlank @Size(max = 100) String name,
			@NotBlank @Size(min = 6, max = 100) String password) {
	}

	public record StaffResponse(String registrationNumber, String name, StaffRole role) {
	}
}
