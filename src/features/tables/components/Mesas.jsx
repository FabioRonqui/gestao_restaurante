import { UtensilsCrossed, Users } from 'lucide-react';
import { MESAS_MOCK } from '../data/mesasMock';
import './Mesas.css';

const STATUS = {
  livre: { rotulo: 'Livre', classe: 'mesas-status--livre' },
  ocupada: { rotulo: 'Ocupada', classe: 'mesas-status--ocupada' },
  reservada: { rotulo: 'Reservada', classe: 'mesas-status--reservada' },
};

export default function Mesas() {
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
            </tr>
          </thead>
          <tbody>
            {MESAS_MOCK.map((mesa) => {
              const status = STATUS[mesa.status];
              return (
                <tr key={mesa.id}>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
