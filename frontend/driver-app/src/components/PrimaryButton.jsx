import React from 'react';
import { Button } from 'react-bootstrap';

const PrimaryButton = ({ children, onClick, className = '', type = 'button', ...props }) => {
    return (
        <Button
            type={type}
            onClick={onClick}
            className={`rounded-pill fw-bold border-0 ${className}`}
            style={{
                backgroundColor: '#20c997', // Mint green base color
                color: '#fff',
                padding: '12px 24px',
                boxShadow: '0 4px 6px rgba(32, 201, 151, 0.3)'
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default PrimaryButton;