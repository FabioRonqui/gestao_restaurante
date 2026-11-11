//  Define a mesa física do restaurante
// (número, status de ocupação, capacidade, etc.
package gestao_restaurante_backend.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mesa")
public class Mesa {

	@Id
	@Column(name = "numero_mesa")
	private Integer tableNumber;

	@Column(name = "quantidade_pessoas", nullable = false)
	private int peopleCount;

	protected Mesa() {
	}

	public Mesa(int tableNumber, int peopleCount) {
		this.tableNumber = tableNumber;
		this.peopleCount = peopleCount;
	}

	public int getTableNumber() {
		return tableNumber;
	}

	public int getPeopleCount() {
		return peopleCount;
	}
}
