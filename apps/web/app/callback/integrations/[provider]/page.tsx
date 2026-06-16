import { Suspense } from "react";
import LoadingScreen from "../../../../components/ui/LoadingScreen";
import IntegrationCallbackClient from "./IntegrationCallbackClient";

export const generateStaticParams = () => [{ provider: "linkedin" }];

type IntegrationCallbackPageProps = {
  params: {
    provider: string;
  };
};

const IntegrationCallbackPage = ({ params }: IntegrationCallbackPageProps) => (
  <Suspense fallback={<LoadingScreen surface="integrationCallback" />}>
    <IntegrationCallbackClient provider={params.provider} />
  </Suspense>
);

export default IntegrationCallbackPage;
