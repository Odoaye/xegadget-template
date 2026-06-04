import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { TemplateSwitcher } from "../components/TemplateSwitcher";

const VoltTemplate = dynamic(() => import("../templates/VoltTemplate").then(m => ({ default: m.VoltTemplate })), { ssr: false });
const NeonTemplate = dynamic(() => import("../templates/NeonTemplate").then(m => ({ default: m.NeonTemplate })), { ssr: false });
const LagosTemplate = dynamic(() => import("../templates/LagosTemplate").then(m => ({ default: m.LagosTemplate })), { ssr: false });
const NaijaTemplate = dynamic(() => import("../templates/NaijaTemplate").then(m => ({ default: m.NaijaTemplate })), { ssr: false });

const TEMPLATES = {
  volt: VoltTemplate,
  neon: NeonTemplate,
  lagos: LagosTemplate,
  naija: NaijaTemplate,
};

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState("volt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("xe-template");
      if (saved && TEMPLATES[saved]) {
        setActiveTemplate(saved);
      }
    } catch {}
  }, []);

  const handleTemplateChange = (id) => {
    setActiveTemplate(id);
    try {
      localStorage.setItem("xe-template", id);
    } catch {}
  };

  const ActiveComponent = TEMPLATES[activeTemplate];

  if (!mounted) {
    return (
      <>
        <Head>
          <title>XE Tech — Premium Gadgets</title>
          <meta name="description" content="XE Tech — Premium gadgets, authentic products, fast delivery." />
        </Head>
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#f7c921] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>XE Tech — Premium Gadgets</title>
        <meta name="description" content="XE Tech — Premium gadgets, authentic products, fast delivery. Shop Smartphones, Earbuds, Laptops and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ActiveComponent />
      <TemplateSwitcher active={activeTemplate} onChange={handleTemplateChange} />
    </>
  );
}
