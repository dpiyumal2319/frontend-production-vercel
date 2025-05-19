import React from 'react';

const LoadingAnimation = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="loading-wave">
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
            </div>
        </div>
    );
};

export default LoadingAnimation;