import { useEffect, useState } from 'react';
import { listCourses } from '../api/course.api.js';
import SiteHeader from '../components/site/SiteHeader.jsx';
import Hero from '../components/site/Hero.jsx';
import Programmes from '../components/site/Programmes.jsx';
import HowItWorks from '../components/site/HowItWorks.jsx';
import WhyOnline from '../components/site/WhyOnline.jsx';
import Marquee from '../components/site/Marquee.jsx';
import SiteFooter from '../components/site/SiteFooter.jsx';

export default function HomePage() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    listCourses()
      .then((d) => setCourses(d.courses))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <Hero />
        <Programmes courses={courses} />
        <HowItWorks />
        <WhyOnline />
        <Marquee />
      </main>
      <SiteFooter />
    </div>
  );
}
