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
3. Inicie a API a partir da raiz do projeto:

   ```powershell
   .\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
   ```

   A API fica disponível em `http://localhost:8080/api`. Na primeira execução,
   ela cria as tabelas necessárias e insere os produtos de exemplo caso o
   cardápio esteja vazio.
4. No navegador do mesmo computador, a API usa automaticamente o host aberto
   pelo app. Em um celular físico, defina `EXPO_PUBLIC_API_URL` no `.env` da
   raiz para `http://<IP-do-computador>:8080/api`.
5. Inicie o aplicativo com `npm run dev` e abra a tela Cardápio.

## API

- `GET /api/products` — lista os produtos do banco.
- `GET /api/orders` — lista os pedidos confirmados.
- `POST /api/orders` — confirma um pedido com `tableNumber` e itens contendo
  `productId` e `quantity`. O preço e o total são calculados pela API.
