import type { SectionType, SectionRegistryEntry } from "~/types/editor";
import { NavbarSection } from "~/sections/Navbar/NavbarSection";
import { HeroSection } from "~/sections/Hero/HeroSection";
import { FeaturesSection } from "~/sections/Features/FeaturesSection";
import { CTASection } from "~/sections/CTA/CTASection";
import { TestimonialsSection } from "~/sections/Testimonials/TestimonialsSection";
import { FAQSection } from "~/sections/FAQ/FAQSection";
import { FooterSection } from "~/sections/Footer/FooterSection";

export const SECTION_REGISTRY: Record<SectionType, SectionRegistryEntry> = {
  navbar: {
    component: NavbarSection,
    label: "Navigation",
    icon: "menu",
    description: "Top navigation bar with logo and links",
    variants: [
      { id: "simple", label: "Simple" },
      { id: "with-cta", label: "With CTA" },
      { id: "centered-logo", label: "Centered Logo" },
    ],
    defaultProps: {
      logo: "Brand",
      navLinks: [
        { label: "Home", url: "#" },
        { label: "About", url: "#" },
        { label: "Contact", url: "#" },
      ],
      ctaText: "Get Started",
      ctaUrl: "#",
    },
    defaultStyle: {
      backgroundColor: "#0d1512",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 0,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "logo", label: "Brand Name", type: "short-text" },
      {
        key: "navLinks",
        label: "Nav Links",
        type: "repeater",
        subFields: [
          { key: "label", label: "Label", type: "short-text" },
          { key: "url", label: "URL", type: "url" },
        ],
      },
      { key: "ctaText", label: "Button Text", type: "short-text" },
      { key: "ctaUrl", label: "Button Link", type: "url" },
    ],
    editableStyles: [],
  },

  hero: {
    component: HeroSection,
    label: "Hero Section",
    icon: "star",
    description: "Main hero area with headline, subheadline, and CTA",
    variants: [
      { id: "centered", label: "Centered" },
      { id: "split-left", label: "Split Image Left" },
      { id: "split-right", label: "Split Image Right" },
    ],
    defaultProps: {
      headline: "Build Faster. Design Better.",
      subheadline:
        "Create stunning, high-converting landing pages in minutes without writing a single line of code.",
      buttonText: "Start Building Free",
      buttonUrl: "#",
      imageUrl: "",
    },
    defaultStyle: {
      backgroundColor: "#0a0f0d",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 80,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "headline", label: "Headline", type: "short-text" },
      { key: "subheadline", label: "Subheadline", type: "long-text" },
      { key: "buttonText", label: "Button Text", type: "short-text" },
      { key: "buttonUrl", label: "Button Link", type: "url" },
      { key: "imageUrl", label: "Image", type: "image" },
    ],
    editableStyles: [],
  },

  features: {
    component: FeaturesSection,
    label: "Features Grid",
    icon: "grid_view",
    description: "Showcase features or benefits with icons",
    variants: [
      { id: "cards", label: "Cards" },
      { id: "icons-row", label: "Icons Row" },
      { id: "alternating", label: "Alternating" },
    ],
    defaultProps: {
      headline: "Everything you need",
      features: [
        {
          icon: "bolt",
          title: "Lightning Fast",
          description: "Optimized for speed and performance out of the box.",
        },
        {
          icon: "palette",
          title: "Smart Styles",
          description: "Global styles that adapt to your brand automatically.",
        },
        {
          icon: "shield",
          title: "Secure",
          description: "Enterprise grade security for all your pages.",
        },
      ],
    },
    defaultStyle: {
      backgroundColor: "#0d1512",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 80,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "headline", label: "Headline", type: "short-text" },
      {
        key: "features",
        label: "Features",
        type: "repeater",
        subFields: [
          { key: "icon", label: "Icon", type: "short-text" },
          { key: "title", label: "Title", type: "short-text" },
          { key: "description", label: "Description", type: "long-text" },
        ],
      },
    ],
    editableStyles: [],
  },

  cta: {
    component: CTASection,
    label: "Call to Action",
    icon: "campaign",
    description: "Call-to-action section with headline and button",
    variants: [
      { id: "banner", label: "Banner" },
      { id: "split", label: "Split" },
      { id: "minimal", label: "Minimal" },
    ],
    defaultProps: {
      headline: "Ready to get started?",
      subheadline: "Join thousands of creators building beautiful websites.",
      buttonText: "Start Free",
      buttonUrl: "#",
    },
    defaultStyle: {
      backgroundColor: "#0d1512",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 80,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "headline", label: "Headline", type: "short-text" },
      { key: "subheadline", label: "Subheadline", type: "long-text" },
      { key: "buttonText", label: "Button Text", type: "short-text" },
      { key: "buttonUrl", label: "Button Link", type: "url" },
    ],
    editableStyles: [],
  },

  testimonials: {
    component: TestimonialsSection,
    label: "Testimonials",
    icon: "format_quote",
    description: "Customer reviews and social proof",
    variants: [
      { id: "grid", label: "Grid" },
      { id: "single", label: "Single" },
      { id: "slider", label: "Slider" },
    ],
    defaultProps: {
      headline: "What our customers say",
      testimonials: [
        {
          quote: "This builder made it incredibly easy to launch our landing page in just a few hours.",
          name: "Sarah Johnson",
          role: "Marketing Director",
          avatar: "",
        },
        {
          quote: "The templates are beautiful and the editor is so intuitive. Highly recommend!",
          name: "Mike Chen",
          role: "Founder, StartupXYZ",
          avatar: "",
        },
        {
          quote: "We switched from a more complex tool and never looked back. Simple and effective.",
          name: "Emily Davis",
          role: "Freelance Designer",
          avatar: "",
        },
      ],
    },
    defaultStyle: {
      backgroundColor: "#0a0f0d",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 80,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "headline", label: "Headline", type: "short-text" },
      {
        key: "testimonials",
        label: "Testimonials",
        type: "repeater",
        subFields: [
          { key: "quote", label: "Quote", type: "long-text" },
          { key: "name", label: "Name", type: "short-text" },
          { key: "role", label: "Role", type: "short-text" },
        ],
      },
    ],
    editableStyles: [],
  },

  faq: {
    component: FAQSection,
    label: "FAQ",
    icon: "help",
    description: "Frequently asked questions section",
    variants: [
      { id: "accordion", label: "Accordion" },
      { id: "two-column", label: "Two Column" },
      { id: "simple", label: "Simple" },
    ],
    defaultProps: {
      headline: "Frequently asked questions",
      faqs: [
        {
          question: "How do I get started?",
          answer: "Simply sign up for a free account, choose a template, and start customizing with our drag-and-drop editor.",
        },
        {
          question: "Can I use my own domain?",
          answer: "Yes! You can connect your custom domain or use our free subdomain to publish your pages.",
        },
        {
          question: "Is there a free plan?",
          answer: "Yes, our free plan includes all core features with a free subdomain. Upgrade anytime for custom domains and more.",
        },
      ],
    },
    defaultStyle: {
      backgroundColor: "#0a0f0d",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 80,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "headline", label: "Headline", type: "short-text" },
      {
        key: "faqs",
        label: "Questions",
        type: "repeater",
        subFields: [
          { key: "question", label: "Question", type: "short-text" },
          { key: "answer", label: "Answer", type: "long-text" },
        ],
      },
    ],
    editableStyles: [],
  },

  footer: {
    component: FooterSection,
    label: "Footer",
    icon: "bottom_navigation",
    description: "Page footer with links and social icons",
    variants: [
      { id: "multi-column", label: "Multi-Column" },
      { id: "simple", label: "Simple" },
      { id: "centered", label: "Centered" },
    ],
    defaultProps: {
      logo: "Brand",
      columns: [
        {
          title: "Product",
          links: [
            { label: "Features", url: "#" },
            { label: "Pricing", url: "#" },
            { label: "Templates", url: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", url: "#" },
            { label: "Blog", url: "#" },
            { label: "Careers", url: "#" },
          ],
        },
        {
          title: "Support",
          links: [
            { label: "Help Center", url: "#" },
            { label: "Contact", url: "#" },
            { label: "Status", url: "#" },
          ],
        },
      ],
      copyright: "© 2026 Brand. All rights reserved.",
      socialLinks: [
        { icon: "language", url: "#" },
        { icon: "mail", url: "#" },
      ],
    },
    defaultStyle: {
      backgroundColor: "#080c0a",
      textColor: "#ffffff",
      accentColor: "#00e5a0",
      paddingY: 60,
      backgroundType: "solid",
    },
    editableProps: [
      { key: "logo", label: "Brand Name", type: "short-text" },
      { key: "copyright", label: "Copyright", type: "short-text" },
      {
        key: "columns",
        label: "Columns",
        type: "repeater",
        subFields: [
          { key: "title", label: "Title", type: "short-text" },
          {
            key: "links",
            label: "Links",
            type: "repeater",
            subFields: [
              { key: "label", label: "Label", type: "short-text" },
              { key: "url", label: "URL", type: "url" },
            ],
          },
        ],
      },
    ],
    editableStyles: [],
  },
};
