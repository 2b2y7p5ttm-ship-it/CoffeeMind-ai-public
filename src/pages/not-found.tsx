export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 text-center">
      <h1 className="font-serif text-6xl text-primary font-medium mb-4">404</h1>
      <h2 className="text-xl font-medium mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">The brew you're looking for has evaporated.</p>
      <a href="/" className="bg-card border border-border px-6 py-2 rounded-full font-medium hover:bg-card/80 transition-colors">
        Back Home
      </a>
    </div>
  );
}
