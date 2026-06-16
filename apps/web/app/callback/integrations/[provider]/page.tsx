import { Suspense } from "react";
import IntegrationCallbackClient from "./IntegrationCallbackClient";

export const generateStaticParams = () => [{ provider: "linkedin" }];

type IntegrationCallbackPageProps = {
  params: {
    provider: string;
  };
};

const IntegrationCallbackPage = ({ params }: IntegrationCallbackPageProps) => (
  <Suspense
    fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="m-0 text-2xl font-semibold">Integration Callback</h1>
        <p className="m-0 text-sm text-[#5b6474]">Preparing callback...</p>
      </main>
    }
  >
    <IntegrationCallbackClient provider={params.provider} />
  </Suspense>
);

export default IntegrationCallbackPage;
