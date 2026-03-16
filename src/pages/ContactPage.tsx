import React, {useState} from 'react';
import {contact, schedule} from '../data/info';

const ContactPage: React.FC = () => {
    const [form, setForm] = useState({name: '', email: '', message: ''});
    const [sent, setSent] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({...prev, [e.target.name]: e.target.value}));

    // Заглушка — в будущем подключить к бэку
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        setForm({name: '', email: '', message: ''});
    };

    return (
        <main className="static-page">

            {/* ── Hero ── */}
            <section className="static-hero static-hero--narrow">
                <div className="static-hero-inner">
                    <p className="static-hero-label">Контакты</p>
                    <h1 className="static-hero-title">Будем рады&nbsp;вас&nbsp;слышать</h1>
                    <p className="static-hero-sub">
                        Вопросы, предложения, заказ торта на мероприятие —
                        пишите или звоните, ответим в течение дня.
                    </p>
                </div>
            </section>

            {/* ── Карточки контактов ── */}
            <section className="contact-cards">
                <div className="contact-card">
                    <span className="contact-card-icon">📍</span>
                    <h3 className="contact-card-title">Адрес</h3>
                    <p className="contact-card-text">{contact.address}</p>
                    <a
                        className="contact-card-link"
                        href="https://yandex.ru/maps/?pt=37.481102,55.670155&z=17&l=map"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Открыть на карте →
                    </a>
                </div>

                <div className="contact-card">
                    <span className="contact-card-icon">📞</span>
                    <h3 className="contact-card-title">Телефон</h3>
                    <p className="contact-card-text">{contact.phone}</p>
                    <a
                        className="contact-card-link"
                        href={`tel:${contact.phone.replace(/[\s()-]/g, '')}`}
                    >
                        Позвонить →
                    </a>
                </div>

                <div className="contact-card">
                    <span className="contact-card-icon">✈️</span>
                    <h3 className="contact-card-title">Telegram</h3>
                    <p className="contact-card-text">Отвечаем быстро</p>
                    <a
                        className="contact-card-link"
                        href={contact.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Написать →
                    </a>
                </div>
            </section>

            {/* ── Встроенная карта ── */}
            <section className="contact-map">
                <iframe
                    title="Яндекс Карта — Silicon Oven"
                    src="https://yandex.ru/map-widget/v1/?ll=37.481102%2C55.670155&z=16&pt=37.481102%2C55.670155%2Cpm2rdm~37.481102%2C55.670155%2CpmRdm&l=map"
                    className="contact-map-iframe"
                    allowFullScreen
                />
            </section>

            {/* ── Часы работы + форма ── */}
            <section className="contact-main">

                {/* Часы работы */}
                <div className="contact-hours-block">
                    <h2 className="static-section-title">Часы работы</h2>
                    <div className="contact-schedule">
                        {schedule.map((entry, i) => (
                            <div key={i} className="contact-schedule-row">
                                <span className="contact-schedule-days">{entry.days}</span>
                                <span className="contact-schedule-dots"/>
                                <span className="contact-schedule-hours">{entry.hours}</span>
                            </div>
                        ))}
                    </div>

                    <div className="contact-note">
                        <span className="contact-note-icon">☕</span>
                        <p>Последний заказ принимаем за 30 минут до закрытия</p>
                    </div>
                </div>

                {/* Форма обратной связи */}
                <div className="contact-form-block">
                    <h2 className="static-section-title">Написать нам</h2>
                    {sent ? (
                        <div className="contact-form-success">
                            <span>✓</span>
                            <p>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="contact-form-row">
                                <div className="contact-form-field">
                                    <label className="auth-label">Имя</label>
                                    <input
                                        className="auth-input"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Иван"
                                        required
                                    />
                                </div>
                                <div className="contact-form-field">
                                    <label className="auth-label">Email</label>
                                    <input
                                        className="auth-input"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="ivan@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="contact-form-field">
                                <label className="auth-label">Сообщение</label>
                                <textarea
                                    className="auth-input admin-textarea"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Хочу заказать торт на 30 человек..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-solid contact-submit-btn">
                                Отправить
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default ContactPage;

