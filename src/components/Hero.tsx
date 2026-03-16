import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => (
  <section className="hero">
    <div className="hero-left">
      <h1 className="hero-title">
        Разделяем <em>ваши</em> вкусы
      </h1>
    </div>
    <div className="hero-right">
      <p className="hero-desc">
        Авторская выпечка на закваске. Только живые ингредиенты. Москва, каждый день с 7:00.
      </p>
      <Link to="/menu" className="btn-solid">Смотреть меню</Link>
    </div>
  </section>
);

export default Hero;
