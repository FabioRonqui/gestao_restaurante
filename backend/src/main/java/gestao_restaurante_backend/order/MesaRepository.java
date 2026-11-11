package gestao_restaurante_backend.order;

import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface MesaRepository extends JpaRepository<Mesa, Integer> {

	java.util.List<Mesa> findAllByOrderByTableNumberAsc();

	@Modifying
	@Query(value = """
			INSERT IGNORE INTO mesa (numero_mesa, quantidade_pessoas)
			VALUES (:tableNumber, :peopleCount)
			""", nativeQuery = true)
	int insertIfAbsent(
			@Param("tableNumber") int tableNumber,
			@Param("peopleCount") int peopleCount);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select table from Mesa table where table.tableNumber = :tableNumber")
	Optional<Mesa> findByIdForUpdate(@Param("tableNumber") int tableNumber);
}
