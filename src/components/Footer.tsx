export const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-primary">DNB Coaching</p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DNB Coaching. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};
