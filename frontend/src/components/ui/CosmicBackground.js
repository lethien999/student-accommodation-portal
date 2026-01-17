/**
 * CosmicBackground Component
 * 
 * A reusable cosmic sparkle background with glowing effects.
 * Follows Single Responsibility Principle - only handles background rendering.
 * 
 * @component
 * @example
 * <CosmicBackground>
 *   <YourContent />
 * </CosmicBackground>
 */
import React from 'react';
import './ui-styles.css';

const CosmicBackground = ({ children, className = '', intensity = 'medium' }) => {
    const intensityClass = `cosmic-bg--${intensity}`;

    return (
        <div className={`cosmic-bg ${intensityClass} ${className}`}>
            <div className="cosmic-bg__overlay" />
            <div className="cosmic-bg__glow cosmic-bg__glow--left" />
            <div className="cosmic-bg__glow cosmic-bg__glow--right" />
            <div className="cosmic-bg__content">
                {children}
            </div>
        </div>
    );
};

export default CosmicBackground;
