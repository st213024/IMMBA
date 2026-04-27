import { homepageData } from "@/data/homepageData";
import {
  AboutSherrySection,
  CTASection,
  CaseStudiesSection,
  CollaborationSection,
  FeaturedTopicsSection,
  Footer,
  FutureInstructorsSection,
  Header,
  HeroSection,
  InsightsSection,
  TeachingMethodSection,
  TopicTagsSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Header brandName={homepageData.brandName} navItems={homepageData.navItems} actions={homepageData.headerActions} />
      <main className="container page-stack">
        <HeroSection hero={homepageData.hero} />
        <AboutSherrySection about={homepageData.about} />
        <TeachingMethodSection steps={homepageData.methodSteps} />
        <FeaturedTopicsSection topics={homepageData.topics} />
        <CaseStudiesSection caseStudies={homepageData.caseStudies} />
        <InsightsSection insights={homepageData.insights} />
        <CollaborationSection collaborations={homepageData.collaborations} />
        <TopicTagsSection tags={homepageData.topicTags} />
        <FutureInstructorsSection data={homepageData.futureInstructors} />
        <CTASection title={homepageData.cta.title} description={homepageData.cta.description} actions={homepageData.cta.actions} />
      </main>
      <Footer
        tagline={homepageData.footer.tagline}
        quickLinks={homepageData.footer.quickLinks}
        courseTopics={homepageData.footer.courseTopics}
        collaborations={homepageData.footer.collaborations}
        email={homepageData.footer.email}
        socials={homepageData.footer.socials}
        copyright={homepageData.footer.copyright}
      />
    </>
  );
}
