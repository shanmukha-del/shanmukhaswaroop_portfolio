import React, { useState } from 'react';
import { useNavigation } from '../../store/useNavigation';
import { navigationStore } from '../../store/navigationStore';
import { DEVELOPER_PROFILE, WORLDS_DATA } from '../../data/portfolioData';
import { WoodenButton } from '../ui/WoodenButton';
import { HangingAdventureCard } from '../ui/HangingAdventureCard';

interface ModalItem {
  title: string;
  subtitle: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  details: string[];
  link?: string;
}

/**
 * RealmView - Genuine document-flow page with synchronized visual movement.
 * Contains all 8 actual HTML sections:
 * - Chapter 0: Pure Cinematic Opening (100vh)
 * - Chapter 1: Main Voxel Universe
 * - Chapters 2-7: Worlds 01 through 06 with prominent headings, supportive introductions,
 *   physical chain-hanging 3D cards, and tactile wooden buttons.
 * - Concluding Footer in normal document flow.
 * Single source of truth: native browser scrolling.
 */
export const RealmView: React.FC = () => {
  const { deviceType } = useNavigation();
  const [activeModal, setActiveModal] = useState<ModalItem | null>(null);

  const isMobile = deviceType === 'mobile';

  // Support direct section scrolling via hash or query param on initial load
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const chapterParam = params.get('chapter');
    const sectionParam = params.get('section');
    const hash = window.location.hash;

    const targetId = sectionParam 
      ? sectionParam 
      : chapterParam 
      ? `chapter-${chapterParam}` 
      : hash 
      ? hash.replace('#', '') 
      : null;

    if (targetId) {
      const applyScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          window.scrollTo(0, el.offsetTop);
        }
      };
      applyScroll();
      requestAnimationFrame(applyScroll);
      setTimeout(applyScroll, 50);
    }
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        zIndex: 10,
        pointerEvents: 'auto'
      }}
    >
      {/* ========================================================================= */}
      {/* CHAPTER 0: PURE CINEMATIC OPENING SCREEN (100vh)                          */}
      {/* ========================================================================= */}
      <section
        id="chapter-0"
        className="world-document-section"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '3rem',
          background: 'transparent'
        }}
      >
        {/* Subtle, elegant scroll indicator inviting user into the universe */}
        <div
          onClick={() => scrollTo('chapter-1')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.4rem',
            background: 'rgba(5, 7, 15, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 90, 43, 0.4)',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            transition: 'all 0.3s ease'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#fef3c7'
            }}
          >
            SCROLL TO ENTER UNIVERSE
          </span>
          <span
            style={{
              color: '#d4af37',
              fontSize: '1rem',
              animation: 'bounce 1.6s infinite'
            }}
          >
            ↓
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 1: MAIN VOXEL UNIVERSE                                            */}
      {/* ========================================================================= */}
      <section id="chapter-1" className="world-document-section">
        <div
          style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(138, 43, 226, 0.18)',
              border: '1px solid rgba(138, 43, 226, 0.5)',
              borderRadius: '20px',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🏛️</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c084fc',
                letterSpacing: '0.12em'
              }}
            >
              CENTRAL NEXUS // MAIN VOXEL UNIVERSE
            </span>
          </div>

          {/* Prominent Golden Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.9rem' : '3rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.35)',
              marginBottom: '0.8rem'
            }}
          >
            MAIN VOXEL UNIVERSE
          </h1>

          {/* Subtitle & Supportive Intro */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.92rem' : '1.15rem',
              lineHeight: 1.65,
              color: '#e2e8f0',
              maxWidth: '820px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
              marginBottom: '2.5rem'
            }}
          >
            The journey of <strong>{DEVELOPER_PROFILE.name}</strong> — six interconnected realms
            representing foundational learning, engineering skills, software projects, competitive trials,
            honored milestones, and future horizons.
          </p>

          {/* 3D Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.2rem',
              justifyContent: 'center'
            }}
          >
            <WoodenButton onClick={() => scrollTo('chapter-2')} icon="⚔️" delay={0.1}>
              ENTER ORIGIN VILLAGE
            </WoodenButton>
            <WoodenButton onClick={() => navigationStore.toggleMinimap()} icon="🗺️" delay={0.2}>
              EXPLORE WORLD MAP
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-0')} icon="↺" delay={0.3}>
              REPLAY PROLOGUE
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 2: WORLD 01 - THE ORIGIN VILLAGE                                  */}
      {/* ========================================================================= */}
      <section id="chapter-2" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🌿</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#34d399',
                letterSpacing: '0.12em'
              }}
            >
              REALM 01 // THE ORIGIN VILLAGE
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            THE BEGINNING OF THE JOURNEY
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            A journey shaped by learning, curiosity, experimentation, and the desire to build meaningful technology.
          </p>

          {/* 3 Chain-Hanging 3D Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            <HangingAdventureCard
              title="Computing Studies"
              subtitle="B.Tech Computer Science Core"
              badge="FOUNDATION"
              badgeColor="#10b981"
              icon="📜"
              delay={0.1}
            >
              Comprehensive study of computational logic, software architecture principles, algorithmic paradigms,
              and structured programming disciplines.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="Algorithmic Thinking"
              subtitle="Problem Solving Rigor"
              badge="DISCIPLINE"
              badgeColor="#34d399"
              icon="⚖️"
              delay={0.2}
            >
              Disciplined practice with fundamental data structures, algorithm efficiency analysis, logical
              deconstruction, and structured problem resolution.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="Independent Exploration"
              subtitle="Curiosity & Experimentation"
              badge="EXPLORATION"
              badgeColor="#6ee7b7"
              icon="🌱"
              delay={0.3}
            >
              Hands-on prototyping, writing early command-line tools, experimenting with browser-based visuals, and
              building software from first principles.
            </HangingAdventureCard>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-1')} icon="⬅" delay={0.4}>
              MAIN UNIVERSE
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-3')} icon="➔" delay={0.5}>
              WORKSHOP
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 3: WORLD 02 - THE CREATOR'S WORKSHOP                             */}
      {/* ========================================================================= */}
      <section id="chapter-3" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(0, 240, 255, 0.18)',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>⚒️</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.12em'
              }}
            >
              REALM 02 // THE CREATOR'S WORKSHOP
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            WHERE IDEAS BECOME REALITY
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            The technologies, programming skills, experimentation, and creative thinking behind the projects.
          </p>

          {/* 4 Chain-Hanging 3D Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            <HangingAdventureCard
              title="Core Languages"
              subtitle="TypeScript • JavaScript • Python • C++"
              badge="CONFIRMED"
              badgeColor="#00f0ff"
              icon="⚡"
              delay={0.1}
            >
              Type-safe application engineering, expressive scripting, functional & object-oriented paradigms, and
              high-performance logic.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="Frontend & 3D WebGL"
              subtitle="React • Three.js • Vite • Tailwind"
              badge="CONFIRMED"
              badgeColor="#38bdf8"
              icon="🖥️"
              delay={0.2}
            >
              Real-time GPU rendering, interactive voxel worlds, responsive state trees, and smooth 60 FPS user
              experiences.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="Backend & Data"
              subtitle="Node.js • Database Management • APIs"
              badge="CONFIRMED"
              badgeColor="#a855f7"
              icon="🗄️"
              delay={0.3}
            >
              RESTful backend architectures, schema design, session authentication, and reliable transactional data
              handling.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="Frontier Exploration"
              subtitle="WebGPU • Spatial Web Architectures"
              badge="EXPLORATION"
              badgeColor="#f59e0b"
              icon="🔭"
              delay={0.4}
            >
              Active research into compute shaders, spatial computing browser pipelines, and next-generation WebGL/WebGPU
              integrations.
            </HangingAdventureCard>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-2')} icon="⬅" delay={0.5}>
              ORIGIN VILLAGE
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-4')} icon="➔" delay={0.6}>
              PROJECT KINGDOM
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 4: WORLD 03 - THE PROJECT KINGDOM                                */}
      {/* ========================================================================= */}
      <section id="chapter-4" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(168, 85, 247, 0.18)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🏰</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c084fc',
                letterSpacing: '0.12em'
              }}
            >
              REALM 03 // THE PROJECT KINGDOM
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(168, 85, 247, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            THINGS I HAVE BUILT
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            Real projects developed to solve practical problems and explore technology.
          </p>

          {/* 4 Chain-Hanging Project Cards with Clickable Detail Modals */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            {WORLDS_DATA[2]?.projects?.map((proj, idx) => (
              <HangingAdventureCard
                key={proj.id}
                title={proj.title}
                subtitle={proj.subtitle}
                badge={proj.districtName.split(':')[0]}
                badgeColor="#00f0ff"
                icon="📁"
                delay={0.1 * (idx + 1)}
                clickable
                actionLabel="EXPLORE PROJECT SPECIFICATIONS"
                onClick={() =>
                  setActiveModal({
                    title: proj.title,
                    subtitle: proj.subtitle,
                    category: proj.districtName,
                    badge: 'VERIFIED PROJECT',
                    badgeColor: '#00f0ff',
                    details: [proj.overview, ...proj.verifiedFeatures]
                  })
                }
              >
                <p style={{ marginBottom: '0.8rem' }}>{proj.overview}</p>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>➔ CLICK TO VIEW DETAILED MODAL SPECIFICATIONS</span>
                </div>
              </HangingAdventureCard>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-3')} icon="⬅" delay={0.5}>
              WORKSHOP
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-5')} icon="➔" delay={0.6}>
              TRIAL GROUNDS
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 5: WORLD 04 - THE TRIAL GROUNDS                                   */}
      {/* ========================================================================= */}
      <section id="chapter-5" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>⚔️</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#f87171',
                letterSpacing: '0.12em'
              }}
            >
              REALM 04 // THE TRIAL GROUNDS
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(239, 68, 68, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            LEARNED THROUGH BUILDING AND COMPETING
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            Hackathons and real problem-solving experiences.
          </p>

          {/* 4 Chain-Hanging Hackathon Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            {WORLDS_DATA[3]?.challenges?.map((c, idx) => (
              <HangingAdventureCard
                key={c.id}
                title={c.eventName}
                subtitle={c.projectOrChallenge}
                badge={c.result}
                badgeColor={c.result.includes('Prize') ? '#f59e0b' : '#ef4444'}
                icon="⚔️"
                delay={0.1 * (idx + 1)}
                clickable
                actionLabel="VIEW EVENT MILESTONE"
                onClick={() =>
                  setActiveModal({
                    title: c.eventName,
                    subtitle: `${c.projectOrChallenge} • ${c.result}`,
                    category: 'VERIFIED HACKATHON RECORD',
                    badge: c.result,
                    badgeColor: c.result.includes('Prize') ? '#f59e0b' : '#ef4444',
                    details: [c.description]
                  })
                }
              >
                <p style={{ marginBottom: '0.6rem' }}>{c.description}</p>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: c.result.includes('Prize') ? '#fbbf24' : '#f87171',
                    fontWeight: 700
                  }}
                >
                  🏆 RESULT: {c.result.toUpperCase()}
                </div>
              </HangingAdventureCard>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-4')} icon="⬅" delay={0.5}>
              PROJECT KINGDOM
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-6')} icon="➔" delay={0.6}>
              ACHIEVEMENT REALM
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 6: WORLD 05 - THE ACHIEVEMENT REALM                               */}
      {/* ========================================================================= */}
      <section id="chapter-6" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🏆</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fbbf24',
                letterSpacing: '0.12em'
              }}
            >
              REALM 05 // THE ACHIEVEMENT REALM
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            MILESTONES ALONG THE WAY
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            Key milestones, competitive distinctions, and recognized contributions earned through consistent dedication.
          </p>

          {/* 4 Chain-Hanging Monument Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            {WORLDS_DATA[4]?.achievements?.map((ach, idx) => (
              <HangingAdventureCard
                key={ach.id}
                title={ach.event}
                subtitle={ach.projectOrDomain}
                badge={ach.distinction}
                badgeColor={ach.distinction.includes('Prize') ? '#f59e0b' : '#38bdf8'}
                icon="🏛️"
                delay={0.1 * (idx + 1)}
                clickable
                actionLabel="VIEW MONUMENT SUMMARY"
                onClick={() =>
                  setActiveModal({
                    title: ach.event,
                    subtitle: `${ach.projectOrDomain} • ${ach.distinction}`,
                    category: ach.representation,
                    badge: ach.distinction,
                    badgeColor: ach.distinction.includes('Prize') ? '#f59e0b' : '#38bdf8',
                    details: [ach.summary, `Representation: ${ach.representation}`]
                  })
                }
              >
                <p style={{ marginBottom: '0.6rem' }}>{ach.summary}</p>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ✦ {ach.representation}
                </div>
              </HangingAdventureCard>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-5')} icon="⬅" delay={0.5}>
              TRIAL GROUNDS
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-7')} icon="➔" delay={0.6}>
              WORLD BUILDER
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 7: WORLD 06 - THE WORLD BUILDER & FINALE                          */}
      {/* ========================================================================= */}
      <section id="chapter-7" className="world-document-section">
        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* World Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 1rem',
              background: 'rgba(59, 130, 246, 0.18)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '20px',
              marginBottom: '0.8rem'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🌐</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#60a5fa',
                letterSpacing: '0.12em'
              }}
            >
              REALM 06 // THE WORLD BUILDER & FINALE
            </span>
          </div>

          {/* Prominent Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.8rem' : '2.7rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#fef3c7',
              textShadow: '0 4px 18px rgba(0, 0, 0, 0.9), 0 0 35px rgba(59, 130, 246, 0.35)',
              marginBottom: '0.6rem'
            }}
          >
            BUILDING BEYOND THE IDEAS
          </h2>

          {/* Supportive Message */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '780px',
              margin: '0 auto 2.5rem auto',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
            }}
          >
            Entrepreneurship, technology leadership, and continuing the journey into the future.
          </p>

          {/* 3 Chain-Hanging Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1.5rem',
              width: '100%',
              marginBottom: '2.5rem'
            }}
          >
            <HangingAdventureCard
              title="ApexCode Network Solutions"
              subtitle="Founder: K. Shanmukhaswaroop"
              badge="FOUNDER"
              badgeColor="#3b82f6"
              icon="🌐"
              delay={0.1}
            >
              Founded ApexCode Network Solutions to deliver modern software solutions, digital infrastructure, web
              engineering, and technical architecture consulting.
              <div style={{ marginTop: '0.8rem' }}>
                <a
                  href="https://apexcodenetwork.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    color: '#60a5fa',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    textDecoration: 'none'
                  }}
                >
                  VISIT APEXCODENETWORK.COM ↗
                </a>
              </div>
            </HangingAdventureCard>

            <HangingAdventureCard
              title="CODEVISION 2K26"
              subtitle="Independent Technology Event"
              badge="ORGANIZER"
              badgeColor="#a855f7"
              icon="⚡"
              delay={0.2}
            >
              Organized and led CODEVISION 2K26, coordinating competitive coding arenas, developer workshops, student
              technical challenges, and community learning tracks.
            </HangingAdventureCard>

            <HangingAdventureCard
              title="The Unfinished Horizon"
              subtitle="Future Horizons"
              badge="CONTINUING"
              badgeColor="#10b981"
              icon="✨"
              delay={0.3}
            >
              <strong>THE NEXT CHAPTER IS STILL BEING BUILT.</strong> Expanding into scalable distributed systems,
              interactive 3D spatial computing, and next-generation developer tooling.
            </HangingAdventureCard>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <WoodenButton onClick={() => scrollTo('chapter-6')} icon="⬅" delay={0.4}>
              ACHIEVEMENT REALM
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-0')} icon="↺" delay={0.5}>
              REPLAY JOURNEY
            </WoodenButton>
            <WoodenButton onClick={() => scrollTo('chapter-1')} icon="🏛️" delay={0.6}>
              MAIN UNIVERSE
            </WoodenButton>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONCLUDING DOCUMENT-FLOW FOOTER                                           */}
      {/* ========================================================================= */}
      <footer
        id="portfolio-footer"
        style={{
          width: '100%',
          padding: isMobile ? '2.5rem 1rem' : '4rem 2rem',
          background:
            'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 3px, transparent 3px, transparent 6px), linear-gradient(180deg, rgba(14, 10, 7, 0.92) 0%, rgba(5, 3, 2, 0.98) 100%)',
          borderTop: '2px solid #8b5a2b',
          textAlign: 'center',
          boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.25rem' : '1.6rem',
              fontWeight: 800,
              color: '#fef3c7',
              letterSpacing: '0.08em',
              marginBottom: '0.6rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            "THE NEXT CHAPTER IS STILL BEING BUILT."
          </h3>

          <p
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem'
            }}
          >
            A developer portfolio shaped by curiosity, verified engineering accomplishments, competitive hackathon
            podiums, and entrepreneurial ventures.
          </p>

          {/* Verified Social & Company Links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.8rem',
              justifyContent: 'center',
              marginBottom: '1.8rem'
            }}
          >
            <a
              href={DEVELOPER_PROFILE.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.55rem 1.1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(139, 90, 43, 0.6)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              GITHUB ↗
            </a>
            <a
              href={DEVELOPER_PROFILE.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.55rem 1.1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(139, 90, 43, 0.6)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              LINKEDIN ↗
            </a>
            <a
              href="https://apexcodenetwork.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.55rem 1.1rem',
                background: 'rgba(59, 130, 246, 0.25)',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              APEXCODE NETWORK SOLUTIONS ↗
            </a>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.4)'
            }}
          >
            © 2026 BEYOND THE BLOCKS // K. Shanmukhaswaroop. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* INTERACTIVE DETAIL MODAL (Temple Run Carved Wood & Stone Frame)           */}
      {/* ========================================================================= */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(3, 3, 8, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.2rem',
            pointerEvents: 'auto'
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background:
                'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 3px, transparent 3px, transparent 6px), linear-gradient(160deg, #1f1712 0%, #120d09 100%)',
              border: '2px solid #8b5a2b',
              borderBottom: '5px solid #130a04',
              borderRadius: '8px',
              padding: '1.8rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(212, 175, 55, 0.25)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                paddingBottom: '0.8rem'
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    color: activeModal.badgeColor || '#d4af37',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  {activeModal.category}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    margin: '0.2rem 0',
                    color: '#fef3c7',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {activeModal.title}
                </h2>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {activeModal.subtitle}
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'linear-gradient(180deg, #3d2617 0%, #20130a 100%)',
                  border: '1px solid #8b5a2b',
                  borderBottom: '3px solid #100a06',
                  borderRadius: '4px',
                  color: '#fef3c7',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: '1.5rem' }}>
              {activeModal.details.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    marginBottom: '0.75rem'
                  }}
                >
                  <span style={{ color: '#d4af37', fontSize: '0.9rem' }}>✦</span>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: '#e2e8f0',
                      margin: 0
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <WoodenButton onClick={() => setActiveModal(null)} icon="✕">
                CLOSE WINDOW
              </WoodenButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealmView;
