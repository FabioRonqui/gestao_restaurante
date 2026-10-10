import './app.css';
import cadastro from '../assets/images/cadastro.png';

function App() {
  return (
    <div className="home-container">
      <img className="home-image" src={cadastro} alt="Ícone de cadastro" />
      <h1 className="home-title">Bem-vindo à minha Página Home!</h1>
      <p className="home-text">Esta é uma página inicial simples construída com Vite e React.</p>
      <button className="home-button" onClick={() => alert('Botão clicado!')}>
        Clique Aqui
      </button>
    </div>
  );
}

export default App;
