package gestao_restaurante_backend.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, Integer> {
	List<CustomerOrder> findAllByTable_TableNumberOrderByCreatedAtDesc(int tableNumber);

	List<CustomerOrder> findAllByTable_TableNumber(int tableNumber);
}
