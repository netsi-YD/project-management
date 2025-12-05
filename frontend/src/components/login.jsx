import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', formData);
        // Will connect to backend later
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo Section */}
                <div className="logo-section">
                    <div className="logo-container">
                        <img 
                            src="/image/logo.png" 
                            alt="University of Gondar Logo" 
                            className="university-logo"
                        />
                    </div>
                    <div className="login-header">
                        <h2>University of Gondar</h2>
                        <h3>Project Management System</h3>
                        <p>Sign in to your account</p>
                    </div>
                </div>

                {/* Form Section - NO LABELS, just inputs */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button type="submit" className="login-btn">
                        Log in
                    </button>

                    <div className="signup-section">
                        <p>Don't have an account? <a href="/signup">Sign up</a></p>
                        <p className="terms-text">
                            By signing up or logging in, you consent to University of Gondar's Terms of Use and Privacy Policy.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;