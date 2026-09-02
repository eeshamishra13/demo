import { useEffect, useRef, useState } from 'react';
import { LandingBackground } from './LandingBackground';
import { useDecodeText } from '../hooks/useDecodeText';

interface LandingPageProps {
  onEnterNoc: () => void;
}

export function LandingPage({ onEnterNoc }: LandingPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        setHeroVisible(true);
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const line1 = useDecodeText('FROM ALERT CHAOS', heroVisible, 0);
  const line2 = useDecodeText('TO ONE ROOT CAUSE', heroVisible, 500);

  return (
    <div style={{ position: 'relative' }}>
      {/* Intro section */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        <LandingBackground />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: 'clamp(2.4rem, 7vw, 4.6rem)',
              letterSpacing: '0.02em',
              color: 'var(--ink-0)',
              margin: 0,
            }}
          >
            BHARATNET
            <small
              style={{
                display: 'block',
                fontFamily: 'var(--sans)',
                fontSize: '0.32em',
                fontWeight: 600,
                letterSpacing: '0.28em',
                color: 'var(--fiber)',
                marginTop: '0.6em',
              }}
            >
              AIOps NOC COMMANDER
            </small>
          </h1>
          <p
            style={{
              marginTop: '1.6em',
              fontSize: '0.82rem',
              letterSpacing: '0.24em',
              color: 'var(--ink-2)',
              fontWeight: 500,
            }}
          >
            AUTONOMOUS NETWORK INTELLIGENCE
          </p>
          <div
            style={{
              marginTop: '3.4em',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              color: 'var(--ink-2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6em',
            }}
          >
            <span
              className="animate-stem-pulse"
              style={{ width: 1, height: 34, background: 'linear-gradient(var(--fiber), transparent)' }}
            />
            <span>SCROLL TO ENTER</span>
          </div>
        </div>
      </section>

      {/* Hero section */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '6vh 6vw 10vh',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 920 }}>
          <h2
            className="font-serif"
            style={{
              fontWeight: 400,
              lineHeight: 1.06,
              fontSize: 'clamp(2.1rem, 6vw, 4.2rem)',
              color: 'var(--ink-0)',
              margin: 0,
            }}
          >
            <span style={{ display: 'block' }}>
              {line1.map((c, i) => (
                <span key={i} className="kchar">
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
            </span>
            <span style={{ display: 'block', color: 'var(--fiber)' }}>
              {line2.map((c, i) => (
                <span key={i} className="kchar">
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
            </span>
          </h2>
          <p
            style={{
              margin: '2em auto 0',
              maxWidth: 560,
              fontSize: '1.02rem',
              lineHeight: 1.6,
              color: 'var(--ink-1)',
            }}
          >
            Turn thousands of noisy network alerts into one explainable incident — identify the root cause, understand the blast radius, and accelerate recovery.
          </p>
          <div style={{ marginTop: '2.6em', display: 'flex', gap: '1em', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onEnterNoc}
              style={{
                padding: '0.9em 1.6em',
                borderRadius: 2,
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                fontWeight: 600,
                border: '1px solid var(--fiber)',
                background: 'var(--fiber)',
                color: '#04120f',
                cursor: 'pointer',
                transition: 'box-shadow 0.25s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(63,214,196,0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Enter NOC Command Center
            </button>
          </div>
          <p style={{ marginTop: '3em', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--ink-2)' }}>
            SCROLL FOR THE LIVE NETWORK
          </p>
        </div>
      </section>
    </div>
  );
}
