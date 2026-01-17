/**
 * AnimatedButton Component
 * 
 * Premium button with glow, ripple effect and hover animations.
 * Follows Single Responsibility - handles only button behavior and effects.
 * 
 * @component
 * @example
 * <AnimatedButton variant="primary" onClick={handleClick}>
 *   Click Me
 * </AnimatedButton>
 */
import React, { useState, useRef } from 'react';
import './ui-styles.css';

const AnimatedButton = ({
    children,
    variant = 'primary', // primary, secondary, success, danger, ghost
    size = 'md', // sm, md, lg
    className = '',
    disabled = false,
    loading = false,
    icon = null,
    onClick,
    type = 'button',
    fullWidth = false,
    ...props
}) => {
    const [ripples, setRipples] = useState([]);
    const buttonRef = useRef(null);

    const handleClick = (e) => {
        if (disabled || loading) return;

        // Create ripple effect
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rippleId = Date.now();

        setRipples(prev => [...prev, { x, y, id: rippleId }]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== rippleId));
        }, 600);

        if (onClick) onClick(e);
    };

    const buttonClasses = [
        'animated-btn',
        `animated-btn--${variant}`,
        `animated-btn--${size}`,
        fullWidth && 'animated-btn--full-width',
        disabled && 'animated-btn--disabled',
        loading && 'animated-btn--loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            ref={buttonRef}
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            {...props}
        >
            <span className="animated-btn__glow" />
            <span className="animated-btn__content">
                {loading && <span className="animated-btn__spinner" />}
                {icon && !loading && <span className="animated-btn__icon">{icon}</span>}
                <span className="animated-btn__text">{children}</span>
            </span>
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="animated-btn__ripple"
                    style={{ left: ripple.x, top: ripple.y }}
                />
            ))}
        </button>
    );
};

export default AnimatedButton;
