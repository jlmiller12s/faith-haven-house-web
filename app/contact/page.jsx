import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact & Support | Faith Haven House",
  description: "Get in touch with Faith Haven House in Saint Peters, MO. Phone: 636-577-5876 | Email: faith.haven.house@gmail.com",
};

export default function ContactPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <Header />
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <div className="section-header">
          <span className="section-eyebrow">Get In Touch</span>
          <h2 className="section-title">Contact Faith Haven House</h2>
          <p className="section-subtitle">
            We are available to answer questions for residents, donors, volunteers, and community partners.
          </p>
        </div>

        <div className="resources-grid" style={{ marginTop: "2.5rem" }}>
          <div className="resource-card">
            <span className="partner-role">DIRECT PHONE</span>
            <h3>Call Us</h3>
            <p>Speak directly with our staff or house monitors.</p>
            <a href="tel:6365775876" className="resource-link">636-577-5876 →</a>
          </div>

          <div className="resource-card">
            <span className="partner-role">EMAIL INQUIRIES</span>
            <h3>Send An Email</h3>
            <p>For general questions, donations, or partnership inquiries.</p>
            <a href="mailto:faith.haven.house@gmail.com" className="resource-link">faith.haven.house@gmail.com →</a>
          </div>

          <div className="resource-card">
            <span className="partner-role">PHYSICAL SANCTUARY</span>
            <h3>Facility Location</h3>
            <p>7338 Mexico Road, Saint Peters, MO 63376</p>
            <a href="https://www.facebook.com/faithhavenhouse" target="_blank" rel="noopener" className="resource-link">Facebook Page →</a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
