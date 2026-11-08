import { useState } from 'react'; // NOVO
import { UtensilsCrossed, Users, Power, Plus } from 'lucide-react'; // NOVO: Power e Plus
import { MESAS_MOCK } from '../data/mesasMock';
import './Mesas.css';

const STATUS = {
  livre: { rotulo: 'Livre', classe: 'mesas-status--livre' },
  ocupada: { rotulo: 'Ocupada', classe: 'mesas-status--ocupada' },
  reservada: { rotulo: 'Reservada', classe: 'mesas-status--reservada' },
  inativa: { rotulo: 'Inativa', classe: 'mesas-status--inativa' }, // NOVO
};

export default function Mesas() {
  // NOVO: copia a lista do mock e coloca a etiqueta "ativa: true" em todas
  const [mesas, setMesas] = useState(
    MESAS_MOCK.map((mesa) => ({ ...mesa, ativa: true }))
  );

  // NOVO: troca ativa <-> inativa só da mesa clicada
  function alternarAtiva(id) {
    setMesas((atuais) =>
      atuais.map((mesa) =>
        mesa.id === id ? { ...mesa, ativa: !mesa.ativa } : mesa
      )
    );
  }

  // NOVO: por enquanto só avisa. Depois abrirá a tela nova de cadastro.
  function cadastrarMesa() {
    alert('Aqui vai abrir a tela de cadastro de mesa.');
  }

  return (
    <main className="mesas-page">
      <header className="mesas-header">
        <div className="mesas-brand">
          <UtensilsCrossed size={22} aria-hidden="true" />
          <span>Delícias Rápidas</span>
        </div>
        <h1 className="mesas-title">Mesas</h1>
      </header>

      <section className="mesas-card" aria-label="Lista de mesas">
        <table className="mesas-table">
          <thead>
            <tr>
              <th scope="col">Número da mesa</th>
              <th scope="col">Quantidade de pessoas</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th> {/* NOVO */}
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => {
              // NOVO: se a mesa está inativa, mostra o status "Inativa"
              const status = mesa.ativa ? STATUS[mesa.status] : STATUS.inativa;
              return (
                <tr
                  key={mesa.id}
                  className={mesa.ativa ? '' : 'mesas-row--inativa'} // NOVO
                >
                  <td data-label="Número da mesa">
                    <span className="mesas-number">Mesa {mesa.numero}</span>
                  </td>
                  <td data-label="Quantidade de pessoas">
                    <span className="mesas-people">
                      <Users size={16} aria-hidden="true" />
                      {mesa.pessoas} {mesa.pessoas === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`mesas-status ${status.classe}`}>
                      {status.rotulo}
                    </span>
                  </td>
                  {/* NOVO: coluna do botão */}
                  <td data-label="Ações">
                    <button
                      type="button"
                      className="mesas-btn"
                      onClick={() => alternarAtiva(mesa.id)}
                    >
                      <Power size={16} aria-hidden="true" />
                      {mesa.ativa ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* NOVO: botão no final da página */}
      <div className="mesas-footer">
        <button
          type="button"
          className="mesas-btn mesas-btn--principal"
          onClick={cadastrarMesa}
        >
          <Plus size={16} aria-hidden="true" />
          Cadastrar mesa
        </button>
      </div>
    </main>
  );
}