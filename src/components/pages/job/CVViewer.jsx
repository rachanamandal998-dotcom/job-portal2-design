import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Download, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, Star, Printer, Share2, Linkedin, Github, Globe, Calendar,
  FileText, CheckCircle, TrendingUp, Ban
} from "lucide-react";
import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";
import "../../styles/CVViewer.css";

export default function ViewCvPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const chartsRef = useRef({});

  // Mock candidate data - replace with API call
  const candidate = {
    id: parseInt(id) || 1,
    name: "Rachana Sharma",
    title: "Senior Frontend Developer",
    email: "rachana.sharma@email.com",
    phone: "+977-9812345678",
    location: "Kathmandu, Nepal",
    linkedin: "linkedin.com/in/rachana",
    github: "github.com/rachana",
    portfolio: "rachana.dev",
    summary: "Passionate frontend developer with 5+ years of experience building scalable web applications using React, TypeScript, and modern web technologies. Proven track record of delivering high-quality products and leading development teams.",
    score: 92,
    matchScore: 95,
    resumeScore: 88,
    experience: 5,
    expectedSalary: "80K-100K",
    noticePeriod: "30 days",
    skills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Node.js', level: 85 },
      { name: 'Next.js', level: 88 },
      { name: 'GraphQL', level: 75 },
      { name: 'AWS', level: 70 },
      { name: 'Docker', level: 65 },
      { name: 'Figma', level: 80 }
    ],
    workExp: [
      { role: "Senior Frontend Developer", company: "Tech Corp", duration: "2022 - Present", location: "Remote", description: "Led frontend team of 5, built scalable React apps, improved performance by 40%" },
      { role: "Frontend Developer", company: "Web Solutions", duration: "2020 - 2022", location: "Kathmandu", description: "Developed responsive web applications, collaborated with UX team" },
      { role: "Junior Developer", company: "StartupXYZ", duration: "2019 - 2020", location: "Lalitpur", description: "Built MVP features, learned modern web stack" }
    ],
    education: [
      { degree: "BS Computer Science", school: "Tribhuvan University", duration: "2016 - 2020", gpa: "3.8" },
      { degree: "High School", school: "St. Xavier's College", duration: "2014 - 2016", gpa: "4.0" }
    ],
    projects: [
      { name: "E-Commerce Platform", tech: "React, Node.js, MongoDB", description: "Built full-stack e-commerce with payment integration" },
      { name: "Analytics Dashboard", tech: "Next.js, Chart.js, PostgreSQL", description: "Real-time analytics dashboard for 10K+ users" }
    ],
    certifications: [
      { name: "AWS Certified Developer", issuer: "Amazon", year: "2023" },
      { name: "React Advanced", issuer: "Meta", year: "2022" }
    ],
    languages: ["English - Fluent", "Nepali - Native", "Hindi - Conversational"],
    achievements: ["Employee of the Year 2023", "Best Team Player 2022", "Innovation Award"],
    applicationDate: "2024-05-15",
    status: "shortlisted"
  };

  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());

    // Skill Radar Chart
    const skillCtx = document.getElementById('skillRadar');
    if (skillCtx) {
      chartsRef.current.skill = new Chart(skillCtx, {
        type: 'radar',
        data: {
          labels: candidate.skills.slice(0, 6).map(s => s.name),
          datasets: [{
            label: 'Skill Level',
            data: candidate.skills.slice(0, 6).map(s => s.level),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.2)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { beginAtZero: true, max: 100, grid: { color: '#fff7ed' } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    // Performance Doughnut
    const perfCtx = document.getElementById('perfChart');
    if (perfCtx) {
      chartsRef.current.perf = new Chart(perfCtx, {
        type: 'doughnut',
        data: {
          labels: ['Technical', 'Communication', 'Problem Solving', 'Teamwork'],
          datasets: [{
            data: [90, 85, 88, 92],
            backgroundColor: ['#f97316', '#fb923c', '#22c55e', '#3b82f6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true } } }
        }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [candidate]);

  const getRecommendation = () => {
    if (candidate.matchScore >= 90) return { text: "Highly Recommended", color: "#22c55e" };
    if (candidate.matchScore >= 75) return { text: "Recommended", color: "#f97316" };
    if (candidate.matchScore >= 60) return { text: "Average Match", color: "#fbbf24" };
    return { text: "Low Match", color: "#ef4444" };
  };

  const recommendation = getRecommendation();

  return (
    <div className="cv-page">
      <div className="cv-header no-print glass">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Candidate Profile</h1>
        <div className="header-actions">
          <button className="btn-premium" onClick={() => window.print()}>
            <Printer size={18} /> Print
          </button>
          <button className="btn-premium">
            <Download size={18} /> Download PDF
          </button>
          <button className="btn-premium">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

      <div className="cv-container">
        <motion.div
          className="cv-hero glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="cv-avatar">{candidate.name.charAt(0)}</div>
          <div className="cv-info">
            <h2>{candidate.name}</h2>
            <p className="cv-title">{candidate.title}</p>
            <div className="cv-contact">
              <span><Mail size={14} /> {candidate.email}</span>
              <span><Phone size={14} /> {candidate.phone}</span>
              <span><MapPin size={14} /> {candidate.location}</span>
            </div>
            <div className="cv-socials">
              <a href={`https://${candidate.linkedin}`}><Linkedin size={18} /></a>
              <a href={`https://${candidate.github}`}><Github size={18} /></a>
              <a href={`https://${candidate.portfolio}`}><Globe size={18} /></a>
            </div>
            <div className="cv-badges">
              <div className="match-badge" style={{ background: recommendation.color }}>
                <Star size={16} /> {recommendation.text}
              </div>
              <div className="score-badge">
                <TrendingUp size={16} /> {candidate.matchScore}% Match
              </div>
            </div>
          </div>
        </motion.div>

        <div className="cv-grid">
          <motion.div className="cv-section glass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3><Award size={20} /> Professional Summary</h3>
            <p>{candidate.summary}</p>
            <div className="summary-stats">
              <div><strong>Experience:</strong> {candidate.experience} Years</div>
              <div><strong>Expected:</strong> {candidate.expectedSalary}</div>
              <div><strong>Notice:</strong> {candidate.noticePeriod}</div>
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3><TrendingUp size={20} /> Skill Analysis</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              <canvas id="skillRadar" />
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3><Briefcase size={20} /> Skills</h3>
            <div className="skills-grid">
              {candidate.skills.map((skill, i) => (
                <div key={i} className="skill-item">
                  <div className="skill-header">
                    <span>{skill.name}</span>
                    <span className="skill-level">{skill.level}%</span>
                  </div>
                  <div className="skill-bar">
                    <motion.div
                      className="skill-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h3><CheckCircle size={20} /> Performance</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              <canvas id="perfChart" />
            </div>
            <div className="perf-scores">
              <div><strong>Resume Score:</strong> {candidate.resumeScore}/100</div>
              <div><strong>Match Score:</strong> {candidate.matchScore}/100</div>
            </div>
          </motion.div>

          <motion.div className="cv-section glass full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3><Briefcase size={20} /> Work Experience</h3>
            <div className="timeline">
              {candidate.workExp.map((exp, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>{exp.role}</h4>
                    <p className="timeline-company">{exp.company} • {exp.location}</p>
                    <p className="timeline-duration">{exp.duration}</p>
                    <p className="timeline-desc">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <h3><GraduationCap size={20} /> Education</h3>
            {candidate.education.map((edu, i) => (
              <div key={i} className="edu-item">
                <h4>{edu.degree}</h4>
                <p>{edu.school}</p>
                <p className="edu-year">{edu.duration} • GPA: {edu.gpa}</p>
              </div>
            ))}
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <h3><Award size={20} /> Certifications</h3>
            {candidate.certifications.map((cert, i) => (
              <div key={i} className="cert-item">
                <CheckCircle size={16} color="#22c55e" />
                <div>
                  <div className="cert-name">{cert.name}</div>
                  <div className="cert-issuer">{cert.issuer} • {cert.year}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div className="cv-section glass full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <h3><FileText size={20} /> Projects</h3>
            <div className="projects-grid">
              {candidate.projects.map((proj, i) => (
                <div key={i} className="project-card">
                  <h4>{proj.name}</h4>
                  <p className="project-tech">{proj.tech}</p>
                  <p>{proj.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
            <h3>Languages</h3>
            <div className="lang-list">
              {candidate.languages.map((lang, i) => (
                <div key={i} className="lang-item">{lang}</div>
              ))}
            </div>
          </motion.div>

          <motion.div className="cv-section glass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
            <h3>Achievements</h3>
            {candidate.achievements.map((ach, i) => (
              <div key={i} className="achievement-item">
                <Award size={16} color="#f97316" />
                <span>{ach}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="action-footer glass">
          <button className="btn-premium success"><CheckCircle size={18} /> Shortlist</button>
          <button className="btn-premium"><Calendar size={18} /> Schedule Interview</button>
          <button className="btn-premium danger"><Ban size={18} /> Reject</button>
        </div>
      </div>
    </div>
  );
}
