import * as React from "react";

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    // Hook for Sentry / external logging:
    // if (typeof window !== "undefined" && (window as any).Sentry) (window as any).Sentry.captureException(error);
  }
  reset = () => this.setState({ hasError: false, error: undefined });
  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-[50vh] grid place-items-center p-6 text-center">
        <div className="max-w-sm">
          <div className="text-5xl mb-3">😵</div>
          <h2 className="font-display text-2xl font-bold">Algo deu errado</h2>
          <p className="text-sm text-muted-foreground mt-2">{this.state.error?.message ?? "Erro inesperado na interface."}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <button onClick={this.reset} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold">Tentar novamente</button>
            <a href="/" className="h-10 px-4 rounded-xl border border-border font-semibold grid place-items-center">Ir para a loja</a>
          </div>
        </div>
      </div>
    );
  }
}
