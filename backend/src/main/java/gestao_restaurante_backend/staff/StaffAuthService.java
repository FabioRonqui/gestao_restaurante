package gestao_restaurante_backend.staff;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StaffAuthService {

	private static final int ITERATIONS = 120_000;
	private static final int KEY_LENGTH = 256;
	private final StaffRepository staff;
	private final SecureRandom random = new SecureRandom();
	private final Map<String, StaffIdentity> sessions = new ConcurrentHashMap<>();

	public StaffAuthService(
			StaffRepository staff,
			@Value("${staff.bootstrap.junior-password:}") String juniorPassword,
			@Value("${staff.bootstrap.pleno-password:}") String plenoPassword,
			@Value("${staff.bootstrap.manager-password:}") String managerPassword) {
		this.staff = staff;
		bootstrap("000202", "Funcionário Junior", juniorPassword, StaffRole.JUNIOR);
		bootstrap("000505", "Funcionário Pleno", plenoPassword, StaffRole.PLENO);
		bootstrap("10000", "Gerente", managerPassword, StaffRole.GERENTE);
	}

	@Transactional
	public LoginResponse login(String registrationNumber, String password) {
		StaffMember member = staff.findById(registrationNumber)
				.filter(candidate -> matches(password, candidate.getPasswordHash()))
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.UNAUTHORIZED, "RE ou senha inválidos."));
		StaffRole role = roleFor(member.getRegistrationNumber());
		if (member.getRole() != role) {
			member.updateRole(role);
		}
		String token = UUID.randomUUID().toString();
		StaffIdentity identity = new StaffIdentity(
				member.getRegistrationNumber(), member.getName(), role);
		sessions.put(token, identity);
		return new LoginResponse(token, identity.registrationNumber(), identity.name(), identity.role());
	}

	public StaffIdentity require(String token) {
		StaffIdentity identity = sessions.get(token);
		if (identity == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão da equipe inválida ou expirada.");
		}
		return identity;
	}

	public LoginResponse getSession(String token) {
		StaffIdentity identity = require(token);
		return new LoginResponse(
				token, identity.registrationNumber(), identity.name(), identity.role());
	}

	public void logout(String token) {
		sessions.remove(token);
	}

	public StaffIdentity requireAtLeast(String token, StaffRole minimumRole) {
		StaffIdentity identity = require(token);
		if (rank(identity.role()) < rank(minimumRole)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seu nível de acesso não permite esta ação.");
		}
		return identity;
	}

	@Transactional
	public StaffMember addStaff(String registrationNumber, String name, String password) {
		StaffRole role = roleFor(registrationNumber);
		if (role == StaffRole.GERENTE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O RE 10000 é reservado ao gerente.");
		}
		if (staff.existsById(registrationNumber)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Este RE já está cadastrado.");
		}
		return staff.save(new StaffMember(registrationNumber, name, hash(password), role));
	}

	private void bootstrap(String re, String name, String password, StaffRole role) {
		if (password == null || password.isBlank()) {
			throw new IllegalStateException(
					"Configure STAFF_" + role + "_PASSWORD no ambiente ou em backend/.env antes de iniciar.");
		}
		if (!staff.existsById(re)) {
			staff.save(new StaffMember(re, name, hash(password), role));
		}
	}

	private String hash(String password) {
		byte[] salt = new byte[16];
		random.nextBytes(salt);
		byte[] derived = derive(password, salt);
		return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(derived);
	}

	private boolean matches(String password, String encoded) {
		String[] parts = encoded.split(":", 2);
		if (parts.length != 2) {
			return false;
		}
		byte[] salt = Base64.getDecoder().decode(parts[0]);
		byte[] expected = Base64.getDecoder().decode(parts[1]);
		return MessageDigest.isEqual(expected, derive(password, salt));
	}

	private byte[] derive(String password, byte[] salt) {
		PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
		try {
			return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
		} catch (Exception error) {
			throw new IllegalStateException("Não foi possível proteger a senha do funcionário.", error);
		} finally {
			spec.clearPassword();
		}
	}

	private StaffRole roleFor(String re) {
		if ("10000".equals(re)) {
			return StaffRole.GERENTE;
		}
		if (re == null || !re.matches("\\d{6}")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O RE do funcionário deve ter seis dígitos.");
		}
		char privilegeDigit = re.charAt(re.length() - 3);
		return switch (privilegeDigit) {
			case '2' -> StaffRole.JUNIOR;
			case '5' -> StaffRole.PLENO;
			default -> throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "Os três últimos dígitos do RE devem começar com 2 (Junior) ou 5 (Pleno).");
		};
	}

	private int rank(StaffRole role) {
		return switch (role) {
			case JUNIOR -> 0;
			case PLENO -> 1;
			case GERENTE -> 2;
		};
	}

	public record StaffIdentity(String registrationNumber, String name, StaffRole role) {
	}

	public record LoginResponse(String token, String registrationNumber, String name, StaffRole role) {
	}
}
