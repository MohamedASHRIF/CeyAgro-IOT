const Footer = () => {
  return (
    <footer className="border-t bg-background px-4 py-2 text-md text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-center gap-1 sm:flex-row sm:justify-center sm:gap-6 text-center">
        <p>© {new Date().getFullYear()} Infinitunm 360 (Pvt) Ltd.</p>
        <div className="flex gap-4">
          <a href="/terms" className="underline hover:text-primary">
            Terms
          </a>
          <a href="/privacy" className="underline hover:text-primary">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
