// O JPA que é uma dependencia criada com springboot,
// faz a comunicaçao com o nosso banco atravez do repository
// usando o processo de crud.

// Nesse arquivo ele executa operações de banco para os pedidos.
package gestao_restaurante_backend.order;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, Integer> {
	List<CustomerOrder> findAllByTable_TableNumberOrderByCreatedAtDesc(int tableNumber);

	List<CustomerOrder> findAllByTable_TableNumber(int tableNumber);

	List<CustomerOrder> findAllByStatusCodeOrderByCreatedAtDesc(int statusCode);

	boolean existsByTable_TableNumberAndStatusCodeAndCreatedAtAfter(
			int tableNumber,
			int statusCode,
			LocalDateTime createdAfter);
}
