import { InfluencerDashboard } from "@/components/InfluencerDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionContainer } from "@/components/layout/SectionContainer";

export default function InfluenceurDashboard() {
  return (
    <PageContainer width="wide">
      <SectionContainer spacing="content">
        <InfluencerDashboard />
      </SectionContainer>
    </PageContainer>
  );
}
