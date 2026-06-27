import { auth } from "@/auth";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Isolation } from "@/components/landing/isolation";
import { Roles } from "@/components/landing/roles";
import { Capabilities } from "@/components/landing/capabilities";
import { Trust } from "@/components/landing/trust";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  const session = await auth();
  const authed = !!session?.user;
  return (
    <>
      <Nav authed={authed} />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <Isolation />
        <Roles />
        <Capabilities />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
