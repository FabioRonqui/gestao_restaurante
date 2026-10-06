import './app.css';

function App() {
  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo à minha Página Home!</h1>
      <p className="home-text">Esta é uma página inicial simples construída com Vite e React.</p>
      <button className="home-button" onClick={() => alert('Botão clicado!')}>
        Clique Aqui
      </button>
    </div>
  );
}

export default App;
