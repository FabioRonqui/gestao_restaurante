# Delícias Rápidas

Aplicativo Expo/React Native para consultar o cardápio, montar um pedido para
uma mesa e acompanhar os pedidos confirmados. Os produtos e pedidos são
armazenados no MySQL por meio da API Spring Boot.

## Configuração local

1. Crie o banco `db_restaurante` no MySQL.
2. Copie `backend/.env.example` para `backend/.env` e preencha as credenciais
   locais, inclusive a senha do MySQL. O arquivo `.env` é ignorado pelo Git;
   não coloque senhas no código. Use `localhost:3306` quando o MySQL e o
   backend estiverem no mesmo computador.
3. Para iniciar apenas o Spring Boot diretamente no terminal atual:

   ```powershell
   npm.cmd run backend
   ```

   Esse comando verifica MySQL em `localhost:3306` e carrega `backend/.env`.
   Mantenha esse terminal aberto; `Ctrl+C` encerra o backend.
4. Em outro terminal, inicie o app web:

   ```powershell
   npm.cmd run web
   ```

   Se o backend já estiver ativo, o launcher reutiliza a API. Caso contrário,
   inicia o Spring Boot em outra janela. Mantenha os terminais abertos. Se o
   banco ou a API falhar, confira as mensagens do Spring Boot. A API fica
   disponível em `http://localhost:8080/api`. Na primeira execução, ela cria
   as tabelas e insere os produtos de exemplo se o cardápio estiver vazio.
5. O frontend detecta automaticamente o host do navegador ou do Expo Metro e
   acessa a API na porta 8080. Só defina `EXPO_PUBLIC_API_URL` no `.env` da
   raiz se o backend estiver em outro computador. Nesse caso, use o IP atual
   dessa máquina. O backend escuta na rede local (`0.0.0.0:8080`), mas o MySQL
   permanece acessível somente pelo backend em `localhost:3306`. Os aparelhos
   precisam estar na mesma rede, e o firewall privado do computador do backend
   deve permitir a porta 8080. Não exponha essa API sem autenticação à internet.

## API

- `GET /api/products` — lista os produtos do banco.
- `GET /api/orders` — lista os pedidos confirmados.
- `POST /api/orders` — confirma um pedido com `tableNumber` e itens contendo
  `productId` e `quantity`. O preço e o total são calculados pela API.
