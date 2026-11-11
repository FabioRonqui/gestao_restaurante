CREATE TABLE IF NOT EXISTS mesa_sessoes (
  numero_mesa INT NOT NULL,
  token CHAR(36) NOT NULL,
  expira_em DATETIME NOT NULL,
  PRIMARY KEY (numero_mesa),
  CONSTRAINT mesa_sessoes_ibfk_1
    FOREIGN KEY (numero_mesa) REFERENCES mesa (numero_mesa)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS funcionarios (
  re VARCHAR(6) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  senha_hash VARCHAR(128) NOT NULL,
  privilegio VARCHAR(10) NOT NULL,
  PRIMARY KEY (re)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
