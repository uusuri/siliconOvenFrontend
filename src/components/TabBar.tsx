import React, { useRef, useEffect, useState } from 'react';

interface Tab<T extends string> {
    key: T;
    label: string;
}

interface TabBarProps<T extends string> {
    tabs: Tab<T>[];
    active: T;
    onChange: (key: T) => void;
}

// Универсальная полоска вкладок с анимирующимся индикатором
function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    // Пересчитываем позицию индикатора при смене активной вкладки
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const activeBtn = container.querySelector<HTMLButtonElement>('.menu-tab.active');
        if (!activeBtn) return;
        setIndicatorStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth,
        });
    }, [active]);

    return (
        <div className="menu-tabs" ref={containerRef}>
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`menu-tab ${active === tab.key ? 'active' : ''}`}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
            {/* Скользящий индикатор */}
            <div
                className="menu-tab-indicator"
                style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
            />
        </div>
    );
}

export default TabBar;

