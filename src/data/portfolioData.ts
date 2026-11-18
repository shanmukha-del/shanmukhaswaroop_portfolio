import { DeveloperProfile, WorldData } from '../types/portfolio';

export const DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'K. Shanmukhaswaroop',
  preferredName: 'Shanmukhaswaroop',
  title: 'Developer & Creative Technologist',
  bioSummary:
    'Developer focused on modern web applications, interactive 3D spatial computing, and clean systems architecture. Founder at ApexCode Network Solutions and organizer of CODEVISION 2K26.',
  characterVisuals: {
    upperBody: 'Navy futuristic hoodie',
    accents: 'Violet accents',
    accessories: 'Over-ear headphones',
    lowerBody: 'Black cargo pants',
    footwear: 'Sneakers',
    likeness: "Preserves the character reference's face, dark swept hairstyle, and proportions."
  },
  socialLinks: {
    github: 'https://github.com/shanmukhaswaroop',
    linkedin: 'https://linkedin.com/in/shanmukhaswaroop'
  }
};

export const WORLDS_DATA: WorldData[] = [
  {
    id: 'origin-village',
    realmNumber: 1,
    name: 'The Origin Village',
    subtitle: 'Roots, Foundations & Journey',
    tagline: 'The starting point: developing curiosity for computing, algorithms, and interactive software.',
    videoAsset: '/videos/03_Origin_Village.mp4',
    coordinates: { x: -80, y: 15, z: -60 },
    themeColor: '#10b981', // Emerald
    accentColor: '#34d399',
    skyColor: '#06281e',
    ambientLightColor: '#10b981',
    narrativeLead:
      'Set across warm cobblestone paths and green voxel landscapes, the Origin Village marks the beginning of Shanmukhaswaroop’s journey—discovering core programming principles and taking the first steps in software development.',
    detailedStory: [
      'Curiosity began with computational logic, understanding how software executes, and writing initial command-line scripts.',
      'Learning core data structures and algorithmic problem-solving built a disciplined foundation for writing clean, structured code.',
      'Expanding from console applications into the browser opened the door to interactive visual interfaces, setting the direction for web development.'
    ],
    keyAttributes: [
      'Problem Solving Fundamentals',
      'Algorithmic Thinking',
      'Computer Science Core',
      'Continuous Learning Mindset'
    ]
  },
  {
    id: 'creators-workshop',
    realmNumber: 2,
    name: "The Creator's Workshop",
    subtitle: 'Skills & Technologies',
    tagline: 'The technology workshop showcasing confirmed engineering skills and exploratory interests.',
    videoAsset: '/videos/04_Creators_Workshop.mp4',
    coordinates: { x: -40, y: 35, z: -100 },
    themeColor: '#8a2be2', // Electric Violet
    accentColor: '#a855f7',
    skyColor: '#17062e',
    ambientLightColor: '#8a2be2',
    narrativeLead:
      'A futuristic voxel workshop featuring coding stations, technology displays, and interactive holographic panels representing verified developer tools and technologies.',
    detailedStory: [
      'The Creator’s Workshop presents technical skills organized by domain, distinguishing verified capabilities from active areas of exploration.',
      'Proficiency is demonstrated through working projects and code implementations rather than arbitrary numerical percentage ratings.',
      'Core focus areas include modern JavaScript/TypeScript, reactive frontend interfaces, backend services, and interactive 3D WebGL environments.'
    ],
    keyAttributes: [
      'Modern Web Technologies',
      'Interactive 3D WebGL',
      'Clean Code Practices',
      'Full-Stack Foundations'
    ],
    skills: [
      { name: 'JavaScript (ESNext)', category: 'Programming & Core', status: 'confirmed' },
      { name: 'TypeScript', category: 'Programming & Core', status: 'confirmed' },
      { name: 'Python', category: 'Programming & Core', status: 'confirmed' },
      { name: 'C++', category: 'Programming & Core', status: 'confirmed' },
      { name: 'React', category: 'Frontend', status: 'confirmed' },
      { name: 'HTML5 & CSS3', category: 'Frontend', status: 'confirmed' },
      { name: 'Three.js / WebGL', category: 'Frontend', status: 'confirmed' },
      { name: 'Node.js', category: 'Backend & Data', status: 'confirmed' },
      { name: 'Database Management', category: 'Backend & Data', status: 'confirmed' },
      { name: 'Git & Version Control', category: 'Tools & Workflows', status: 'confirmed' },
      { name: 'WebGPU (Exploration)', category: 'Frontend', status: 'learning_interest' },
      { name: 'Spatial Web Architectures', category: 'Frontend', status: 'learning_interest' }
    ]
  },
  {
    id: 'project-kingdom',
    realmNumber: 3,
    name: 'The Project Kingdom',
    subtitle: 'Four Project Districts',
    tagline: 'The kingdom showcasing four distinct software projects, each with its own illustrative 3D diorama.',
    videoAsset: '/videos/05_Project_Kingdom.mp4',
    coordinates: { x: 70, y: 40, z: -80 },
    themeColor: '#00f0ff', // Cyan
    accentColor: '#38bdf8',
    skyColor: '#052338',
    ambientLightColor: '#0ea5e9',
    narrativeLead:
      'A vast voxel technology kingdom divided into four distinct districts, each visually representing one of Shanmukhaswaroop’s established projects through custom 3D architectural dioramas.',
    detailedStory: [
      'Each district corresponds to a completed software project, illustrated with customized voxel buildings, landmarks, and structural themes.',
      'Projects encompass academic attendance automation, multi-vendor customer marketplaces, elegant retail shopping interfaces, and departmental administration portals.',
      'All project descriptions reflect factual, verified functionality without unconfirmed statistics, claims, or fabricated metrics.'
    ],
    keyAttributes: [
      'Four Distinct Project Districts',
      'Interactive 3D Dioramas',
      'Verified Functional Scope',
      'Voxel Architectural Identity'
    ],
    projects: [
      {
        id: 'vemu-ams',
        title: 'VEMU AMS',
        subtitle: 'Smart Classroom & Attendance Management System',
        districtName: 'District 01: AMS Plaza',
        overview:
          'An attendance management system designed for smart classroom environments to record, track, and manage student attendance and academic session data.',
        verifiedFeatures: [
          'Attendance tracking and record management',
          'Smart classroom session monitoring',
          'Faculty and student record organization',
          'Classroom technology display interface'
        ],
        visualDiorama: {
          primaryStructure: 'Smart Classroom Building',
          landmarks: ['Attendance Tower', 'Classroom Technology Displays', 'Data Column'],
          palette: {
            primary: '#00f0ff',
            accent: '#38bdf8',
            glow: '#0284c7'
          }
        }
      },
      {
        id: 'iv-mart',
        title: 'IV MART',
        subtitle: 'Customer Marketplace & Order Hub',
        districtName: 'District 02: Market Quarter',
        overview:
          'A customer marketplace platform enabling product catalog browsing, ordering workflows, and administrative store management.',
        verifiedFeatures: [
          'Product catalog and category navigation',
          'Customer order workflow interface',
          'Administrative product management controls',
          'Delivery coordination and tracking views'
        ],
        visualDiorama: {
          primaryStructure: 'Marketplace Pavilion',
          landmarks: ['Admin Tower', 'Delivery Hub', 'Commerce Kiosks'],
          palette: {
            primary: '#10b981',
            accent: '#34d399',
            glow: '#059669'
          }
        }
      },
      {
        id: 'sai-collections',
        title: 'SAI COLLECTIONS',
        subtitle: 'Luxury Retail & Jewellery Shopping Platform',
        districtName: 'District 03: Gilded Arcade',
        overview:
          'A luxury retail and jewellery showcase platform featuring curated collection displays, product galleries, and an elegant shopping storefront.',
        verifiedFeatures: [
          'Luxury jewellery and accessory display showcases',
          'Curated collection galleries with detail views',
          'Elegant digital storefront interface',
          'Customer enquiry and selection portal'
        ],
        visualDiorama: {
          primaryStructure: 'Luxury Shopping Palace',
          landmarks: ['Jewellery Displays', 'Elegant Storefront Arcades', 'Crystalline Showcases'],
          palette: {
            primary: '#f59e0b',
            accent: '#fbbf24',
            glow: '#d97706'
          }
        }
      },
      {
        id: 'vemu-cse',
        title: 'VEMU CSE',
        subtitle: 'Academic & Department Administration Portal',
        districtName: 'District 04: Academic Citadel',
        overview:
          'An academic campus and department management portal providing administrative workflows, departmental updates, and student-faculty communication channels.',
        verifiedFeatures: [
          'Departmental announcements and notice board',
          'HOD administration and faculty coordination modules',
          'Academic curriculum and resource access',
          'Student academic information directory'
        ],
        visualDiorama: {
          primaryStructure: 'University-Style Campus Building',
          landmarks: ['Administration Tower', 'Academic Lecture Halls', 'Department Gateways'],
          palette: {
            primary: '#8a2be2',
            accent: '#a855f7',
            glow: '#7c3aed'
          }
        }
      }
    ]
  },
  {
    id: 'trial-grounds',
    realmNumber: 4,
    name: 'The Trial Grounds',
    subtitle: 'Hackathons & Competitions',
    tagline: 'Competition arenas representing verified hackathon experiences and collaborative problem-solving.',
    videoAsset: '/videos/06_Trial_Grounds.mp4',
    coordinates: { x: 85, y: 15, z: 20 },
    themeColor: '#ef4444', // Magma Red
    accentColor: '#f87171',
    skyColor: '#2b0707',
    ambientLightColor: '#dc2626',
    narrativeLead:
      'A dramatic voxel arena landscape representing the four hackathon experiences undertaken by Shanmukhaswaroop, keeping participation and second-prize achievements strictly and factually distinct.',
    detailedStory: [
      'The Trial Grounds symbolize learning through rapid competition: decomposing problem statements, designing technical architectures, and presenting functional prototypes.',
      'Experiences range from inaugural hackathon participation with Swift Health to earning Second Prize recognitions at KONNECT 2K26 and KAIROTHON 2K26.',
      'All documented events represent confirmed hackathons without exaggerated timelines or unverified rankings.'
    ],
    keyAttributes: [
      'Collaborative Hackathon Sprints',
      'Rapid Solution Prototyping',
      'Factually Verified Outcomes',
      'Competitive Problem Solving'
    ],
    challenges: [
      {
        id: 'ignite-2k26',
        eventName: 'IGNITE 2K26',
        projectOrChallenge: 'Swift Health',
        result: 'Participation',
        description: 'First hackathon attempt with the Swift Health project, focusing on healthcare workflow accessibility.'
      },
      {
        id: 'konnect-2k26',
        eventName: 'KONNECT 2K26',
        projectOrChallenge: 'Swift Health',
        result: 'Second Prize',
        description: 'Iterated and refined version of Swift Health, awarded Second Prize in the technical competition track.'
      },
      {
        id: 'kairothon-2k26',
        eventName: 'KAIROTHON 2K26',
        projectOrChallenge: 'Public Grievance',
        result: 'Second Prize',
        description: 'Civic issue tracking and grievance submission system, securing Second Prize honors.'
      },
      {
        id: 'mohan-babu-hackathon',
        eventName: 'Mohan Babu University Hackathon',
        projectOrChallenge: '24-Hour Hackathon Challenge',
        result: 'Participation',
        duration: '24 Hours',
        description: '24-hour continuous collaborative hackathon solving designated technical problem statements.'
      }
    ]
  },
  {
    id: 'achievement-realm',
    realmNumber: 5,
    name: 'The Achievement Realm',
    subtitle: 'Honors & Recognitions',
    tagline: 'An illustrative voxel realm celebrating verified competition milestones through artistic 3D monuments.',
    videoAsset: '/videos/07_Achievement_Realm.mp4',
    coordinates: { x: 30, y: 55, z: 70 },
    themeColor: '#f59e0b', // Gold / Amber
    accentColor: '#fbbf24',
    skyColor: '#2b1b04',
    ambientLightColor: '#d97706',
    narrativeLead:
      'Luminous stone terraces and floating crystalline monuments representing the developer’s verified second-prize achievements and hackathon milestones. All monuments are illustrative artistic representations.',
    detailedStory: [
      'The Achievement Realm highlights confirmed second-prize recognitions and competitive participation milestones.',
      'Each monument stands as an illustrative 3D voxel representation rather than an assertion of physical certificates or photography.',
      'Unverified academic citations, grand championship claims, and unsupported distinctions are strictly excluded.'
    ],
    keyAttributes: [
      'Confirmed Competition Honors',
      'Illustrative 3D Monuments',
      'Factually Grounded Milestones',
      'Honest Portfolio Representation'
    ],
    achievements: [
      {
        id: 'achieve-konnect',
        event: 'KONNECT 2K26',
        projectOrDomain: 'Swift Health',
        distinction: 'Second Prize',
        representation: 'Illustrative Voxel Crystal Trophy Monument',
        summary: 'Awarded Second Prize at KONNECT 2K26 for the Swift Health solution.'
      },
      {
        id: 'achieve-kairothon',
        event: 'KAIROTHON 2K26',
        projectOrDomain: 'Public Grievance',
        distinction: 'Second Prize',
        representation: 'Illustrative Obsidian & Gold Monument',
        summary: 'Awarded Second Prize at KAIROTHON 2K26 for the Public Grievance portal.'
      },
      {
        id: 'achieve-ignite',
        event: 'IGNITE 2K26',
        projectOrDomain: 'Swift Health',
        distinction: 'Participation',
        representation: 'Illustrative Milestone Beacon Pillar',
        summary: 'Hackathon participation milestone with Swift Health at IGNITE 2K26.'
      },
      {
        id: 'achieve-mohan-babu',
        event: 'Mohan Babu University Hackathon',
        projectOrDomain: '24-Hour Hackathon Challenge',
        distinction: 'Participation',
        representation: 'Illustrative 24-Hour Endurance Spire',
        summary: '24-hour hackathon endurance participation milestone at Mohan Babu University.'
      }
    ]
  },
  {
    id: 'world-builder',
    realmNumber: 6,
    name: 'The World Builder',
    subtitle: 'ApexCode & CODEVISION Finale',
    tagline: 'The finale realm representing ApexCode Network Solutions and the CODEVISION 2K26 event.',
    videoAsset: '/videos/08_World_Builder.mp4',
    coordinates: { x: -60, y: 50, z: 50 },
    themeColor: '#3b82f6', // Sapphire / Cosmic Blue
    accentColor: '#60a5fa',
    skyColor: '#071633',
    ambientLightColor: '#1d4ed8',
    narrativeLead:
      'The culminating realm featuring two verified areas: ApexCode Network Solutions headquarters and the independently organized CODEVISION 2K26 tech event environment.',
    detailedStory: [
      'Area 1: ApexCode Network Solutions headquarters, represented as a futuristic voxel technology structure reflecting the developer’s founder role.',
      'Area 2: CODEVISION 2K26 event environment, represented through a cinematic voxel arena, stage, and event architecture honoring the independently organized technology event.',
      'The experience closes with the forward-looking message: "THE NEXT CHAPTER IS STILL BEING BUILT."'
    ],
    keyAttributes: [
      'ApexCode Network Solutions Founder',
      'CODEVISION 2K26 Independent Organizer',
      'Verified Organization Details',
      'Future Technology Horizons'
    ],
    verifiedOverview: {
      companyName: 'ApexCode Network Solutions',
      companyUrl: 'https://apexcodenetwork.com',
      eventOrganized: 'CODEVISION 2K26'
    }
  }
];

export const UNIVERSE_OVERVIEW = {
  id: 'voxel-universe',
  name: 'The Main Voxel Universe',
  tagline: 'Six interconnected realms representing the journey of K. Shanmukhaswaroop.',
  videoAsset: '/videos/02_Main_Voxel_Universe.mp4',
  prologueVideo: '/videos/01_Opening_Cinematic.mp4',
  coordinates: { x: 0, y: 0, z: 0 },
  themeColor: '#8a2be2',
  narrative:
    'Across six floating voxel realms connected by cosmic light paths, explore the developer journey: foundational learning at Origin Village, confirmed skills at Creator’s Workshop, four projects at Project Kingdom, hackathon challenges at Trial Grounds, verified honors at Achievement Realm, and the ApexCode / CODEVISION finale at World Builder.'
};
