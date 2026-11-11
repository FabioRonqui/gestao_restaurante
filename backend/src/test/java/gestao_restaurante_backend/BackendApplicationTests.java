package gestao_restaurante_backend;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BackendApplicationTests {

	@Value("${staff.bootstrap.junior-password}")
	private String juniorPassword;

	@Value("${staff.bootstrap.pleno-password}")
	private String plenoPassword;

	@Value("${staff.bootstrap.manager-password}")
	private String managerPassword;

	@Value("${local.server.port}")
	private int port;

	@Autowired
	private JdbcTemplate jdbc;

	private final HttpClient http = HttpClient.newHttpClient();

	@Test
	void contextLoads() {
	}

	@Test
	void staffRolesAreEnforcedByTheApi() throws Exception {
		jdbc.update("UPDATE funcionarios SET privilegio = 'GERENTE' WHERE re = '000202'");
		try {
			String juniorToken = login("000202", juniorPassword);
			assertTrue(request("GET", "/api/staff/session", juniorToken, null).body().contains("\"role\":\"JUNIOR\""));
			assertEquals("JUNIOR", jdbc.queryForObject(
					"SELECT privilegio FROM funcionarios WHERE re = '000202'", String.class));
			assertEquals(200, request("GET", "/api/orders/staff/pending", juniorToken, null).statusCode());
			assertEquals(403, request("PATCH", "/api/orders/2147483647/payment", juniorToken, null).statusCode());
			assertEquals(403, request("GET", "/api/staff", juniorToken, null).statusCode());
		} finally {
			jdbc.update("UPDATE funcionarios SET privilegio = 'JUNIOR' WHERE re = '000202'");
		}

		String plenoToken = login("000505", plenoPassword);
		assertTrue(request("GET", "/api/staff/session", plenoToken, null).body().contains("\"role\":\"PLENO\""));
		assertEquals(404, request("PATCH", "/api/orders/2147483647/payment", plenoToken, null).statusCode());

		String managerToken = login("10000", managerPassword);
		assertTrue(request("GET", "/api/staff/session", managerToken, null).body().contains("\"role\":\"GERENTE\""));
		assertEquals(200, request("GET", "/api/staff", managerToken, null).statusCode());
	}

	@Test
	void pendingOrderKeepsTableOccupiedUntilConfirmedReleasedOrInactive() throws Exception {
		int tableNumber = 990001;
		cleanupTable(tableNumber);
		jdbc.update(
				"INSERT INTO mesa (numero_mesa, quantidade_pessoas) VALUES (?, 2) "
						+ "ON DUPLICATE KEY UPDATE quantidade_pessoas = 2",
				tableNumber);

		try {
			String customerToken = startTableSession(tableNumber);
			int pendingOrderId = addPendingOrder(tableNumber, LocalDateTime.now().minusMinutes(30));
			expireSession(tableNumber);

			assertTrue(availability(tableNumber, "another-session").contains("\"available\":false"));
			assertEquals(200, request(
					"GET",
					"/api/orders?tableNumber=" + tableNumber + "&sessionToken=" + customerToken,
					null,
					null).statusCode());
			assertTrue(request("GET", "/api/tables", null, null).body()
					.contains("\"numero\":" + tableNumber + ",\"pessoas\":2,\"status\":\"ocupada\""));
			assertEquals(409, request(
					"POST",
					"/api/tables/session",
					null,
					"{\"tableNumber\":" + tableNumber + ",\"token\":\"another-session\"}").statusCode());
			assertTrue(startTableSession(tableNumber, customerToken).contains(customerToken));

			String plenoToken = login("000505", plenoPassword);
			assertEquals(200, request(
					"PATCH",
					"/api/orders/" + pendingOrderId + "/payment",
					plenoToken,
					null).statusCode());
			assertTrue(availability(tableNumber, "another-session").contains("\"available\":true"));
			assertEquals(403, request(
					"GET",
					"/api/orders?tableNumber=" + tableNumber + "&sessionToken=" + customerToken,
					null,
					null).statusCode());

			String leavingCustomerToken = startTableSession(tableNumber);
			addPendingOrder(tableNumber, LocalDateTime.now().minusMinutes(10));
			assertEquals(200, request(
					"DELETE",
					"/api/tables/" + tableNumber + "/session?token=" + leavingCustomerToken,
					null,
					null).statusCode());
			assertTrue(availability(tableNumber, "another-session").contains("\"available\":true"));

			startTableSession(tableNumber);
			addPendingOrder(tableNumber, LocalDateTime.now().minusHours(3));
			expireSession(tableNumber);
			assertTrue(availability(tableNumber, "another-session").contains("\"available\":true"));
			assertEquals(200, request(
					"POST",
					"/api/tables/session",
					null,
					"{\"tableNumber\":" + tableNumber + ",\"token\":\"another-session\"}").statusCode());
		} finally {
			cleanupTable(tableNumber);
		}
	}

	@Test
	void onlyManagerCanReadTodayTransactions() throws Exception {
		int tableNumber = 990002;
		cleanupTable(tableNumber);
		jdbc.update(
				"INSERT INTO mesa (numero_mesa, quantidade_pessoas) VALUES (?, 2) "
						+ "ON DUPLICATE KEY UPDATE quantidade_pessoas = 2",
				tableNumber);

		try {
			int todayPendingId = addPendingOrder(tableNumber, LocalDateTime.now().withHour(10));
			int todayConfirmedId = addPendingOrder(tableNumber, LocalDateTime.now().withHour(11));
			jdbc.update("UPDATE pedidos SET status = 1 WHERE id = ?", todayConfirmedId);
			int yesterdayOrderId = addPendingOrder(tableNumber, LocalDateTime.now().minusDays(1));

			String juniorToken = login("000202", juniorPassword);
			assertEquals(403, request("GET", "/api/orders/staff/today", juniorToken, null).statusCode());

			String managerToken = login("10000", managerPassword);
			HttpResponse<String> response = request("GET", "/api/orders/staff/today", managerToken, null);
			assertEquals(200, response.statusCode());
			assertTrue(response.body().contains("\"id\":" + todayPendingId));
			assertTrue(response.body().contains("\"id\":" + todayConfirmedId));
			assertFalse(response.body().contains("\"id\":" + yesterdayOrderId));
		} finally {
			cleanupTable(tableNumber);
		}
	}

	private String login(String registrationNumber, String password) throws Exception {
		String body = "{\"registrationNumber\":\"" + escapeJson(registrationNumber)
				+ "\",\"password\":\"" + escapeJson(password) + "\"}";
		HttpResponse<String> response = request("POST", "/api/staff/login", null, body);
		assertEquals(200, response.statusCode());
		Matcher tokenMatch = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(response.body());
		assertTrue(tokenMatch.find(), "Login must return a session token.");
		return tokenMatch.group(1);
	}

	private String startTableSession(int tableNumber) throws Exception {
		return startTableSession(tableNumber, null);
	}

	private String startTableSession(int tableNumber, String existingToken) throws Exception {
		String tokenValue = existingToken == null ? "null" : "\"" + escapeJson(existingToken) + "\"";
		HttpResponse<String> response = request(
				"POST",
				"/api/tables/session",
				null,
				"{\"tableNumber\":" + tableNumber + ",\"token\":" + tokenValue + "}");
		assertEquals(200, response.statusCode());
		Matcher tokenMatch = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(response.body());
		assertTrue(tokenMatch.find(), "Starting a table session must return its token.");
		return tokenMatch.group(1);
	}

	private int addPendingOrder(int tableNumber, LocalDateTime createdAt) {
		KeyHolder keys = new GeneratedKeyHolder();
		jdbc.update(connection -> {
			PreparedStatement statement = connection.prepareStatement(
					"INSERT INTO pedidos (num_mesa, status, data_criacao) VALUES (?, 0, ?)",
					Statement.RETURN_GENERATED_KEYS);
			statement.setInt(1, tableNumber);
			statement.setTimestamp(2, Timestamp.valueOf(createdAt));
			return statement;
		}, keys);
		return keys.getKey().intValue();
	}

	private void expireSession(int tableNumber) {
		jdbc.update(
				"UPDATE mesa_sessoes SET expira_em = ? WHERE numero_mesa = ?",
				Timestamp.valueOf(LocalDateTime.now().minusMinutes(1)),
				tableNumber);
	}

	private String availability(int tableNumber, String token) throws Exception {
		return request(
				"GET",
				"/api/tables/" + tableNumber + "/availability?token=" + token,
				null,
				null).body();
	}

	private void cleanupTable(int tableNumber) {
		jdbc.update("DELETE FROM pedidos WHERE num_mesa = ?", tableNumber);
		jdbc.update("DELETE FROM mesa_sessoes WHERE numero_mesa = ?", tableNumber);
		jdbc.update("DELETE FROM mesa WHERE numero_mesa = ?", tableNumber);
	}

	private HttpResponse<String> request(
			String method,
			String path,
			String token,
			String body) throws Exception {
		HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
		if (token != null) {
			builder.header("X-Staff-Token", token);
		}
		if (body != null) {
			builder.header("Content-Type", "application/json");
		}
		HttpRequest.BodyPublisher publisher = body == null
				? HttpRequest.BodyPublishers.noBody()
				: HttpRequest.BodyPublishers.ofString(body);
		return http.send(
				builder.method(method, publisher).build(),
				HttpResponse.BodyHandlers.ofString());
	}

	private String escapeJson(String value) {
		return value.replace("\\", "\\\\").replace("\"", "\\\"");
	}
}
