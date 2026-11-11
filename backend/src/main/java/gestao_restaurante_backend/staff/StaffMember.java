package gestao_restaurante_backend.staff;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "funcionarios")
public class StaffMember {

	@Id
	@Column(name = "re", length = 6)
	private String registrationNumber;

	@Column(name = "nome", nullable = false, length = 100)
	private String name;

	@Column(name = "senha_hash", nullable = false, length = 128)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(name = "privilegio", nullable = false, length = 10)
	private StaffRole role;

	protected StaffMember() {
	}

	public StaffMember(String registrationNumber, String name, String passwordHash, StaffRole role) {
		this.registrationNumber = registrationNumber;
		this.name = name;
		this.passwordHash = passwordHash;
		this.role = role;
	}

	public String getRegistrationNumber() {
		return registrationNumber;
	}

	public String getName() {
		return name;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public StaffRole getRole() {
		return role;
	}

	void updateRole(StaffRole role) {
		this.role = role;
	}
}
