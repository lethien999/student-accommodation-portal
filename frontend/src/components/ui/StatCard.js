/**
 * StatCard Component
 * 
 * Modern stat card with glassmorphism effect and animated counters.
 * Follows Single Responsibility - displays a single statistic with optional trend.
 * 
 * @component
 */
import React, { useState, useEffect, useRef } from 'react';
import './ui-styles.css';

const StatCard = ({
    title,
    value,
    suffix = '',
    prefix = '',
    icon = null,
    trend = null, // { value: 5.2, direction: 'up' | 'down' }
    color = 'primary', // primary, success, warning, danger, info
    loading = false,
    className = '',
    onClick,
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animationRef = useRef(null);
    const cardRef = useRef(null);

    // Animated counter effect
    useEffect(() => {
        if (loading || typeof value !== 'number') {
            setDisplayValue(value);
            return;
        }

        const duration = 1000;
        const startTime = Date.now();
        const startValue = displayValue || 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (value - startValue) * easeOut;

            setDisplayValue(Math.round(current));

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, loading]);

    const formatValue = (val) => {
        if (typeof val !== 'number') return val;
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toLocaleString();
    };

    const cardClasses = [
        'stat-card',
        `stat-card--${color}`,
        loading && 'stat-card--loading',
        onClick && 'stat-card--clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={cardRef}
            className={cardClasses}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="stat-card__glow" />
            <div className="stat-card__content">
                <div className="stat-card__header">
                    <span className="stat-card__title">{title}</span>
                    {icon && <span className="stat-card__icon">{icon}</span>}
                </div>
                <div className="stat-card__body">
                    {loading ? (
                        <div className="stat-card__skeleton" />
                    ) : (
                        <span className="stat-card__value">
                            {prefix}{formatValue(displayValue)}{suffix}
                        </span>
                    )}
                </div>
                {trend && !loading && (
                    <div className={`stat-card__trend stat-card__trend--${trend.direction}`}>
                        <span className="stat-card__trend-icon">
                            {trend.direction === 'up' ? '↑' : '↓'}
                        </span>
                        <span className="stat-card__trend-value">
                            {trend.value}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
