package gestao_restaurante_backend.order;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface MesaSessaoRepository extends JpaRepository<MesaSessao, Integer> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select session from MesaSessao session where session.tableNumber = :tableNumber")
	Optional<MesaSessao> findByTableNumberForUpdate(@Param("tableNumber") int tableNumber);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select session from MesaSessao session where session.tableNumber = :tableNumber")
	Optional<MesaSessao> findByIdForUpdate(@Param("tableNumber") int tableNumber);

	Optional<MesaSessao> findByTableNumberAndToken(int tableNumber, String token);
}
