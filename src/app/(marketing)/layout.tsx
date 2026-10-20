import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';
import PageMotion from '@/components/motion/PageMotion';
import SmoothScroll from '@/components/motion/SmoothScroll';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <PageMotion />
      <Navbar />
      <main className="flex-grow overflow-x-clip">{children}</main>
      <Footer />
    </>
  );
}
