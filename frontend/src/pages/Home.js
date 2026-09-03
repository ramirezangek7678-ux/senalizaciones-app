import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { usuario } = useAuth();

  return (
    <div>
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at top left, rgba(245,197,24,0.08) 0%, transparent 60%)',
        padding: '3rem 1.5rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 800, textTransform: 'uppercase', lineHeight: 1,
            marginBottom: '1.5rem', color: 'var(--blanco)'
          }}>
            Dona<span style={{ color: 'var(--amarillo)' }}>Red</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--blanco-apagado)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Plataforma de donaciones de insumos. Contribuye con alimentos, ropa, medicamentos y más para quienes más lo necesitan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {usuario ? (
              usuario.rol === 'voluntario' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                  <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--amarillo)', marginBottom: '0.75rem' }}>
                    Bienvenido, {usuario.nombre.split(' ')[0]}
                  </h2>
                  <p style={{ color: 'var(--blanco-apagado)', marginBottom: '1.5rem' }}>
                    Revisa las donaciones asignadas y actualiza su estado.
                  </p>
                  <Link to="/admin/donaciones" className="btn btn-primary">Ver Donaciones →</Link>
                </div>
              ) : (
                <Link to={usuario.rol === 'admin' ? '/admin' : '/productos'} className="btn btn-primary">
                  {usuario.rol === 'admin' ? 'Ir al Panel →' : 'Ver Insumos →'}
                </Link>
              )
            ) : (
              <>
                <Link to="/solicitar" className="btn btn-primary">📦 Quiero Donar →</Link>
                <Link to="/login" className="btn btn-secondary">Iniciar Sesión</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="grid-3">
          {[
            { icono: '📦', titulo: 'Dona en Minutos', desc: 'Elige el insumo, agenda la entrega o recolección y listo.' },
            { icono: '❤️', titulo: 'Impacto Real', desc: 'Tus aportes llegan a comunidades vulnerables con ayuda de voluntarios.' },
          ].map(f => (
            <div key={f.titulo} className="card card-amarillo" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icono}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{f.titulo}</h3>
              <p style={{ color: 'var(--blanco-apagado)', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;