import React from 'react';

const Loader = ({ text = "Synchronizing Node" }) => (
    <div className="loader-wrapper">
        <div className="sovereign-loader"></div>
        <div className="loader-text">{text}...</div>
    </div>
);

export default Loader;
