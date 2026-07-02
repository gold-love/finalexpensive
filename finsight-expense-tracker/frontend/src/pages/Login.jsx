import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFAToken, setTwoFAToken] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const { login, register, verify2FA } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (showScanner && requires2FA) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            scanner.render((decodedText) => {
                let token = decodedText;
                if (decodedText.includes('otpauth://')) {
                    const url = new URL(decodedText);
                    token = url.searchParams.get('secret') || decodedText;
                }
                setTwoFAToken(token);
                scanner.clear();
                setShowScanner(false);
            }, (error) => { });
            return () => {
                try { scanner.clear(); } catch (e) { }
            };
        }
    }, [showScanner, requires2FA]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (requires2FA) {
                await verify2FA(userId, twoFAToken);
                toast.success('Login verified!');
                navigate('/dashboard');
            } else if (isLogin) {
                const data = await login(email, password);
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setUserId(data.userId);
                    toast.info('Please verify with your Identity QR');
                } else {
                    toast.success('Welcome back!');
                    navigate('/dashboard');
                }
            } else {
                const validatePassword = (pwd) => {
                    if (pwd.length < 8) return "Password must be at least 8 characters long.";
                    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
                    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
                    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
                    return null;
                };
                const pwdError = validatePassword(password);
                if (pwdError) {
                    toast.error(pwdError);
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        }
        setLoading(false);
    };

    // Auto-submit if token is scanned and long enough (for OTP secrets it's different, but for codes it works)
    useEffect(() => {
        if (requires2FA && twoFAToken.length >= 6 && !showScanner) {
            handleSubmit();
        }
    }, [twoFAToken]);

    const loginStyles = `
      @keyframes gradientText {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes floatAnim {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      @keyframes typeWriter {
        0% { width: 0; }
        100% { width: 100%; }
      }
      @keyframes blinkCursor {
        from, to { border-color: transparent; }
        50% { border-color: rgba(255,255,255,0.75); }
      }
      .animated-gradient-text {
        background: linear-gradient(270deg, #818cf8, #c084fc, #f472b6);
        background-size: 200% 200%;
        animation: gradientText 5s ease infinite;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .typewriter-wrapper {
        display: inline-block;
      }
      .typewriter-text {
        overflow: hidden;
        white-space: nowrap;
        border-right: 0.15em solid rgba(255,255,255,0.75);
        margin: 0;
        animation: typeWriter 3s steps(40, end), blinkCursor 0.75s step-end infinite;
      }
      .modern-glass-panel {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
    `;

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.15), transparent 25%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{loginStyles}</style>

            {/* Left side: Login Form */}
            <div style={{
                flex: '1 1 500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px',
                zIndex: 10
            }}>
                <div className="card fade-in modern-glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'white', margin: 0 }}>
                        <span style={{ color: '#818cf8', textShadow: '0 0 20px rgba(129, 140, 248, 0.5)' }}>●</span> Finsight
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.95rem' }}>Secure Financial Intelligence</p>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '32px', color: 'white', fontWeight: '600', fontSize: '1.5rem' }}>
                    {requires2FA ? 'Identity Verification' : (isLogin ? 'Welcome Back' : 'Create Account')}
                </h2>

                <form onSubmit={handleSubmit} autoComplete="off">
                    {requires2FA ? (
                        <div className="form-group fade-in">
                            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', textAlign: 'center', color: 'white' }}>🛡️ Scan to Verify</h3>

                            <div style={{ marginBottom: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(!showScanner)}
                                    className="btn"
                                    style={{ background: showScanner ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: showScanner ? '#f87171' : '#818cf8', border: `1px solid ${showScanner ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`, width: '100%', marginBottom: '16px', padding: '12px', borderRadius: '12px', transition: 'all 0.3s ease' }}
                                >
                                    {showScanner ? '❌ Close Scanner' : '📷 Open QR Scanner'}
                                </button>

                                {showScanner ? (
                                    <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                ) : (
                                    <>
                                        <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Verification Code</label>
                                        <input
                                            type="text"
                                            value={twoFAToken}
                                            onChange={(e) => setTwoFAToken(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter 6-digit code"
                                            required
                                            maxLength={6}
                                            autoFocus
                                            autoComplete="off"
                                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '14px' }}
                                        />
                                    </>
                                )}
                            </div>

                            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', lineHeight: '1.5' }}>
                                Scan your <b>Identity QR Card</b> or enter the code manually to continue.
                            </p>

                            {!showScanner && (
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{ width: '100%', marginTop: '24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                                </button>
                            )}

                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginTop: '20px', width: '100%', transition: 'color 0.2s' }}
                                onClick={() => setRequires2FA(false)}
                                onMouseOver={(e) => e.target.style.color = 'white'}
                                onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                            >
                                ← Back to Credentials
                            </button>
                        </div>
                    ) : (
                        <>
                            {!isLogin && (
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-control"
                                        placeholder="John Doe"
                                        required
                                        autoComplete="off"
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                                    />
                                </div>
                            )}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-control"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="off"
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Password</label>
                                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-control"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px', paddingRight: '48px' }}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                                    <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: '13.5px', textDecoration: 'none', fontWeight: '500' }}>
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn"
                                style={{ width: '100%', marginTop: isLogin ? '8px' : '24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                                disabled={loading}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                        </>
                    )}
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    {requires2FA ? '' : (isLogin ? "Don't have an account? " : "Already have an account? ")}
                    {!requires2FA && (
                        <span
                            style={{ color: '#818cf8', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
                            onClick={() => setIsLogin(!isLogin)}
                            onMouseOver={(e) => e.target.style.color = '#a5b4fc'}
                            onMouseOut={(e) => e.target.style.color = '#818cf8'}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    )}
                </p>
            </div>
            </div>

            {/* Right side: Project Text/Showcase */}
            <div style={{
                flex: '2 1 600px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '8%',
                color: 'white',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="fade-in" style={{ animation: 'floatAnim 6s ease-in-out infinite', maxWidth: '650px' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        ✨ Next-Gen Financial Management
                    </div>
                    
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                        Master Your Finances <br/>
                        <div className="typewriter-wrapper" style={{ minHeight: '1.2em', display: 'flex', alignItems: 'center' }}>
                            <span className="animated-gradient-text typewriter-text">With Intelligence.</span>
                        </div>
                    </h1>
                    
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.7', color: '#cbd5e1', marginBottom: '48px', maxWidth: '540px' }}>
                        Take absolute control over your financial footprint. Finsight combines enterprise-grade authentication with real-time budget analytics to help you make smarter decisions.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="animated-gradient-text" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: '800' }}>100%</h3>
                            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>Secure Data</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="animated-gradient-text" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: '800' }}>Sync</h3>
                            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>Real-time</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="animated-gradient-text" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: '800' }}>2FA</h3>
                            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>Protected</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Background decorative elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 1, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 1, pointerEvents: 'none' }}></div>
        </div>
    );
};

export default Login;
