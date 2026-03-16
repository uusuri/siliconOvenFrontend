import React from 'react';
import { schedule, contact } from '../data/info';

const scrollTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const InfoRow: React.FC = () => (
  <section className="info-row">
    <div id="order" className="info-block info-cta">
      <h2 className="info-title">Доставка</h2>
      <p className="info-text">
        Ежедневно с 8:00 до 21:00 по всему городу. Бесплатно от 1500 ₽.
      </p>
      <a href="#" onClick={scrollTo('order')} className="btn-solid inverted">
        Оформить заказ
      </a>
    </div>

    <div id="contact" className="info-block info-hours">
      <h2 className="info-title">Часы работы</h2>
      <div className="hours-list">
        {schedule.map((entry, i) => (
          <div key={i} className="hours-row">
            <span>{entry.days}</span>
            <span>{entry.hours}</span>
          </div>
        ))}
      </div>
      <p className="info-address">📍 {contact.address}</p>
    </div>

    <div id="about" className="info-block info-about">
      <h2 className="info-title">О пекарне</h2>
      <p className="info-text">
        Silicon Oven — пекарня полного цикла. Работаем с 2018 года. 47 видов выпечки, собственная мука, команда из 12 пекарей.
      </p>
      <a href="#" onClick={scrollTo('about')} className="link-arrow">Подробнее →</a>
    </div>
  </section>
);

export default InfoRow;

