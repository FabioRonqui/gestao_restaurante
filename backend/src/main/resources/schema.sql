CREATE TABLE IF NOT EXISTS mesa_sessoes (
  numero_mesa INT NOT NULL,
  token CHAR(36) NOT NULL,
  expira_em DATETIME NOT NULL,
  PRIMARY KEY (numero_mesa),
  CONSTRAINT mesa_sessoes_ibfk_1
    FOREIGN KEY (numero_mesa) REFERENCES mesa (numero_mesa)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
