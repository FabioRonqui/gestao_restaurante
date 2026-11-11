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
   disponível em `http://localhost:8080/api`.
5. O backend valida o esquema existente e espera as tabelas `mesa`, `categorias`,
   `produtos`, `pedidos` e `itens_pedido`. Ele não cria nem insere produtos de
   exemplo; cadastre os produtos e categorias no MySQL.
6. O frontend detecta automaticamente o host do navegador ou do Expo Metro e
   acessa a API na porta 8080. Só defina `EXPO_PUBLIC_API_URL` no `.env` da
   raiz se o backend estiver em outro computador. Nesse caso, use o IP atual
   dessa máquina. O backend escuta na rede local (`0.0.0.0:8080`), mas o MySQL
   permanece acessível somente pelo backend em `localhost:3306`. Os aparelhos
   precisam estar na mesma rede, e o firewall privado do computador do backend
   deve permitir a porta 8080. Não exponha essa API sem autenticação à internet.

## API

- `GET /api/products` — lista os produtos do banco.
- `GET /api/tables` — lista as mesas cadastradas, informa o total e o estado
  livre/ocupada.
- `POST /api/tables` com `numero` e `pessoas` — cadastra uma mesa no MySQL.
- `GET /api/tables/{numero}/availability` — verifica se a mesa está disponível.
- `POST /api/tables/session` com `tableNumber` — reserva uma mesa por duas horas
  e apaga somente os pedidos anteriores dessa mesa quando começa uma nova sessão.
- `DELETE /api/tables/{numero}/session?token=...` — encerra a sessão e libera a
  mesa imediatamente.
- `GET /api/orders?tableNumber=7&sessionToken=...` — lista somente os pedidos
  da mesa e da sessão ativa.
- `POST /api/orders` — confirma um pedido com `tableNumber` e itens contendo
  `productId`, `quantity` e `sessionToken`. O preço e o total são calculados
  pela API.

O status numérico em `pedidos.status` é traduzido assim: `0` aguardando
confirmação, `1` confirmado, `2` em preparo, `3` a caminho, `4` entregue e
`5` cancelado. A API cria o registro de `mesa` com duas pessoas caso o número
selecionado ainda não exista. A API também cria a tabela auxiliar `mesa_sessoes`
caso ela ainda não exista; ela guarda o token de reserva e o horário de expiração.
Na primeira inicialização, as 16 mesas que existiam no cadastro local anterior
são inseridas em `mesa` caso ainda não estejam cadastradas. Mesas adicionadas
depois também são persistidas no MySQL.
