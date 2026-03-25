import "../styles/review.css";
import schoolImage from "../assets/1768199921437.jpg"; 
import welcomeImage from "../assets/saraswati.png"; 

// Gallery images
import image1 from "../assets/gallery/image1.jpg";
import image2 from "../assets/gallery/image2.jpg";
import image3 from "../assets/gallery/image3.jpg";
import image4 from "../assets/gallery/image4.jpg";
import image5 from "../assets/gallery/image5.jpg";
import image6 from "../assets/gallery/image6.jpg";

import {
  BookOpen,
  Calculator,
  Globe,
  Trophy,
  Music,
  Palette,
  Heart,
  Users,
  Leaf,
  Stethoscope,
  HandHelping,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewPage() {
  const navigate = useNavigate();

  const activities = [
    { icon: BookOpen, title: "Quality Education", description: "Modern curriculum with focus on English medium education, preparing students for a bright future.", color: "blue" },
    { icon: Calculator, title: "Mathematics & Science", description: "Strong foundation in STEM subjects with practical experiments and hands-on learning.", color: "amber" },
    { icon: Globe, title: "Language Skills", description: "English, Hindi, and Marathi language training to help students communicate effectively.", color: "green" },
    { icon: Trophy, title: "Sports & Games", description: "Physical education, cricket, kabaddi, and other sports to promote healthy lifestyle.", color: "blue" },
    { icon: Music, title: "Cultural Activities", description: "Music, dance, and drama to nurture creativity and preserve our rich cultural heritage.", color: "amber" },
    { icon: Palette, title: "Art & Craft", description: "Drawing, painting, and craft work to develop artistic skills and creative expression.", color: "green" },
  ];

  const commitments = [
    { icon: BookOpen, title: "Free Education for Farmer Children", description: "100% free education for children of farmers. We believe every child deserves quality education regardless of their family's financial situation." },
    { icon: HandHelping, title: "Support for Underprivileged", description: "Free books, uniforms, and mid-day meals for students from economically weaker sections of society." },
    { icon: Users, title: "Scheduled Caste & Tribal Support", description: "Special scholarships and support programs for SC/ST students to ensure equal opportunities in education." },
    { icon: Heart, title: "Orphan Care Program", description: "Complete educational support for orphan children including tuition, books, and emotional counseling." },
    { icon: Leaf, title: "Village Development", description: "Tree plantation drives, cleanliness campaigns, and awareness programs involving students and villagers." },
    { icon: Stethoscope, title: "Community Health Camps", description: "Regular health check-up camps for students and village residents in association with local hospitals." },
  ];

  return (
    <div className="overview-page">
      {/* Header */}
      <header className="top-nav white-header">
        <div className="school-name">
          <BookOpen size={22} />
          New Saroj English School, Latur
        </div>
        <div className="nav-buttons">
          {/* ✅ Correct navigation */}
          <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="nav-btn" onClick={() => navigate("/teacher-signup")}>Teacher Sign Up</button>
        </div>
      </header>

      {/* Hero section */}
      <main className="hero-section" style={{ backgroundImage: `url(${schoolImage})` }}>
        <div className="blue-overlay" />
        <div className="hero-content">
          <img src={welcomeImage} alt="School Logo" className="welcome-image" />
          <p className="welcome-text">Welcome to</p>
          <h1 className="school-name-large">New Saroj English School</h1>
          <h2 className="location-text">Latur, Maharashtra</h2>
          <p className="mission-text">
            Empowering rural children with quality education.<br />
            Providing free education to farmer children, underprivileged communities, and those who dream big.
          </p>
          <div className="hero-buttons-inline">
            <button
              className="enroll-btn"
              onClick={() => document.getElementById("contact-footer").scrollIntoView({ behavior: "smooth" })}
            >
              Enroll Your Child
            </button>
            <button
              className="learn-btn"
              onClick={() => document.getElementById("activities").scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-box"><strong>500+</strong><br />Students</div>
            <div className="stat-box"><strong>25+</strong><br />Staff Members</div>
            <div className="stat-box"><strong>100%</strong><br />Satisfaction</div>
          </div>
        </div>
      </main>

      {/* Activities Section */}
      <section id="activities" className="activities-section">
        <div className="activities-header">
          <p className="subtitle">What We Offer</p>
          <h2 className="title">School Activities</h2>
          <p className="description">
            We provide comprehensive education that nurtures mind, body, and spirit. Our activities are designed to bring out the best in every child.
          </p>
        </div>
        <div className="activities-grid">
          {activities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className={`icon-box ${activity.color}`}><activity.icon size={28} /></div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-description">{activity.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="gallery-section">
        <div className="gallery-header">
          <p className="gallery-subtitle">Our Gallery</p>
          <h2 className="gallery-title">School Memories</h2>
          <p className="gallery-description">
            A glimpse into our school life and activities.
          </p>
        </div>
        <div className="gallery-grid">
          {[
            { src: image1, alt: "School Event 1" },
            { src: image2, alt: "School Event 2" },
            { src: image3, alt: "School Event 3" },
            { src: image4, alt: "School Event 4" },
            { src: image5, alt: "School Event 5" },
            { src: image6, alt: "School Event 6" },
          ].map((image, index) => (
            <div key={index} className="gallery-card">
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      {/* Commitment Section */}
      <section className="commitment-section">
        <div className="header">
          <h2>Our Commitment</h2>
          <p className="subtitle">Social Work & Community Service</p>
          <p className="description">
            Education is our tool for social change. We are committed to uplifting the underprivileged and creating a more equal society through education.
          </p>
        </div>
        <div className="commitment-grid">
          {commitments.map((item, index) => (
            <div key={index} className="commitment-card">
              <div className="icon-box commitment-icon">
                <item.icon size={28} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
        <div className="education-card">
          <h3>“शिक्षण सर्वांसाठी” – Education for All</h3>
          <p>
            If you know a child who cannot afford education, please bring them to us.<br />
            We promise to provide them quality education absolutely free.
          </p>
          <button className="contact-btn" onClick={() => document.getElementById("contact-footer").scrollIntoView({ behavior: "smooth" })}>
            Contact Us
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-footer" className="footer">
        <div className="footer-content">
          <h4>New Saroj English School</h4>
          <p>
            Empowering rural children with quality English medium education since establishment.
            Building tomorrow's leaders today.
          </p>

          <div className="footer-columns">
            {/* Contact Column */}
            <div>
              <h5>Contact Us</h5>
              <p>Latur, Maharashtra, India</p>
              <p>+91 99228 33910</p>
              <p>newsaroj.latur@gmail.com</p>
            </div>

            {/* Timings Column */}
            <div>
              <h5>School Timings</h5>
              <p>Mon – Sat: 8:00 AM – 4:00 PM</p>
              <p>Office: 9:00 AM – 5:00 PM</p>
              <p>Sunday: Closed</p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h5>Quick Links</h5>
              <p>About Us</p>
              <p>Admissions</p>
              <p>Gallery</p>
              <p>Contact</p>
            </div>
          </div>

          <p className="copyright">
            © 2024 New Saroj English School, Latur. All rights reserved.<br />
            Made with ❤️ for the students of rural India
          </p>
        </div>
      </footer>
    </div>
  )
}






