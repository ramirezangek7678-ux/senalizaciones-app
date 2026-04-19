import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { usuario } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at top left, rgba(245,197,24,0.08) 0%, transparent 60%)',
        padding: '3rem 1.5rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 800, textTransform: 'uppercase', lineHeight: 1,
            marginBottom: '1.5rem', color: 'var(--blanco)'
          }}>
            Señalamiento <span style={{ color: 'var(--amarillo)' }}>MS</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--blanco-apagado)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Realiza tu pedido de forma rápida y sencilla. Servicios de señalamientos viales, industriales y comerciales a tu alcance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {usuario ? (
              usuario.rol === 'empleado' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👷</div>
                  <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--amarillo)', marginBottom: '0.75rem' }}>
                    Bienvenido, {usuario.nombre.split(' ')[0]}
                  </h2>
                  <p style={{ color: 'var(--blanco-apagado)', marginBottom: '1.5rem' }}>
                    Consulta los pedidos asignados a tu área de trabajo.
                  </p>
                  <Link to="/admin/pedidos" className="btn btn-primary">Ver Pedidos →</Link>
                </div>
              ) : (
                <Link to={usuario.rol === 'admin' ? '/admin' : '/agendar'} className="btn btn-primary">
                  {usuario.rol === 'admin' ? 'Ir al Panel →' : 'Nuevo Pedido →'}
                </Link>
              )
            ) : (
              <>
                <Link to="/registro" className="btn btn-primary">Comenzar Ahora →</Link>
                <Link to="/servicios" className="btn btn-secondary">Ver Servicios</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="grid-3">
          {[
            { icono: '📋', titulo: 'Pedido en Minutos', desc: 'Selecciona tu servicio y levanta tu pedido sin llamadas ni esperas.' },
            { icono: '🔔', titulo: 'Seguimiento en Tiempo Real', desc: 'Consulta el estado de tus pedidos: pendiente, confirmado o completado.' },
            { icono: '🔧', titulo: 'Servicios Especializados', desc: 'Señalamientos viales, industriales, comerciales, consultoría e instalación.' },
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
