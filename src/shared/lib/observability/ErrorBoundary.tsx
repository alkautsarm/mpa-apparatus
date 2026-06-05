import * as Sentry from "@sentry/react";

function Fallback() {
  return (
    <div role="alert" style={{ padding: "2rem", textAlign: "center" }}>
      <p>Something went wrong.</p>
    </div>
  );
}

export function ObservabilityErrorBoundary({ children }: { children: React.ReactNode }) {
  return <Sentry.ErrorBoundary fallback={<Fallback />}>{children}</Sentry.ErrorBoundary>;
}
