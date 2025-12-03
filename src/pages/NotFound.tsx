import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-pixel text-6xl text-primary neon-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Game Not Found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist
        </p>
        <Link to="/">
          <Button variant="neon" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Game
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
