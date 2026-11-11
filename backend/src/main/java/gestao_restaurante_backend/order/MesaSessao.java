package gestao_restaurante_backend.order;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mesa_sessoes")
public class MesaSessao {

	@Id
	@Column(name = "numero_mesa")
	private Integer tableNumber;

	@Column(name = "token", nullable = false, length = 36)
	private String token;

	@Column(name = "expira_em", nullable = false)
	private LocalDateTime expiresAt;

	protected MesaSessao() {
	}

	public MesaSessao(int tableNumber, String token, LocalDateTime expiresAt) {
		this.tableNumber = tableNumber;
		this.token = token;
		this.expiresAt = expiresAt;
	}

	public String getToken() {
		return token;
	}

	public Integer getTableNumber() {
		return tableNumber;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public void renew(String token, LocalDateTime expiresAt) {
		this.token = token;
		this.expiresAt = expiresAt;
	}
}
