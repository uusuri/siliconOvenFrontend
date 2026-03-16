import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => (
    <main className="static-page">

        {/* ── Hero ── */}
        <section className="static-hero">
            <div className="static-hero-inner">
                <p className="static-hero-label">О нас</p>
                <h1 className="static-hero-title">Мы печём с&nbsp;2018 года</h1>
                <p className="static-hero-sub">
                    Silicon Oven — пекарня полного цикла в сердце Москвы. Собственная мука,
                    живые закваски и команда из 12 пекарей, которые начинают работу в 4 утра.
                </p>
            </div>
            <div className="static-hero-img-wrap">
                <div className="static-hero-img-placeholder">🔥</div>
            </div>
        </section>

        {/* ── Цифры ── */}
        <section className="about-stats">
            {[
                { value: '2018', label: 'Год основания' },
                { value: '47',   label: 'Видов выпечки' },
                { value: '12',   label: 'Пекарей' },
                { value: '4:00', label: 'Начало смены' },
            ].map(s => (
                <div key={s.label} className="about-stat">
                    <span className="about-stat-value">{s.value}</span>
                    <span className="about-stat-label">{s.label}</span>
                </div>
            ))}
        </section>

        {/* ── История ── */}
        <section className="static-section">
            <div className="static-section-inner">
                <div className="static-text-col">
                    <h2 className="static-section-title">Как всё начиналось</h2>
                    <p className="static-body">
                        В 2018 году двое друзей арендовали крошечное помещение на Вернадского
                        и поставили единственную подовую печь. Первые три месяца работали в минус —
                        зато хлеб уходил за час после открытия.
                    </p>
                    <p className="static-body">
                        Сегодня Silicon Oven — это просторный зал, собственная мельница для
                        помола зерна и меню из 47 позиций. Мы по-прежнему не используем
                        промышленных улучшителей и готовим тесто вручную.
                    </p>
                </div>
                <div className="static-img-col">
                    <div className="static-img-placeholder">🍞</div>
                </div>
            </div>
        </section>

        {/* ── Ценности ── */}
        <section className="about-values">
            <h2 className="static-section-title" style={{ textAlign: 'center', marginBottom: 40 }}>
                Наши принципы
            </h2>
            <div className="about-values-grid">
                {[
                    { icon: '🌾', title: 'Своя мука',       text: 'Мелем зерно на собственной мельнике. Никакого промышленного помола.' },
                    { icon: '⏱',  title: 'Долгое брожение', text: 'Закваска зреет 16–20 часов. Именно это даёт вкус и лёгкость хлеба.' },
                    { icon: '🤝', title: 'Честный состав',  text: 'Никаких E-добавок. Только мука, вода, соль и время.' },
                    { icon: '🌍', title: 'Локальные фермы', text: 'Яйца и молоко — от фермеров Подмосковья. Зерно — из Тульской области.' },
                ].map(v => (
                    <div key={v.title} className="about-value-card">
                        <span className="about-value-icon">{v.icon}</span>
                        <h3 className="about-value-title">{v.title}</h3>
                        <p className="about-value-text">{v.text}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* ── CTA ── */}
        <section className="static-cta">
            <h2 className="static-cta-title">Попробуйте сами</h2>
            <p className="static-cta-sub">Свежая выпечка каждый день с 7 утра</p>
            <Link to="/menu" className="btn-solid">Открыть меню</Link>
        </section>

    </main>
);

export default AboutPage;

