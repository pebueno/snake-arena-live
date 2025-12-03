import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2 } from 'lucide-react';

type AuthMode = 'login' | 'signup';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await login(email, password);
        if (error) {
          toast({ title: 'Login Failed', description: error, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
          navigate('/');
        }
      } else {
        if (!username.trim()) {
          toast({ title: 'Error', description: 'Username is required', variant: 'destructive' });
          return;
        }
        const { error } = await signup(username, email, password);
        if (error) {
          toast({ title: 'Signup Failed', description: error, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome!', description: 'Account created successfully.' });
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-pixel text-2xl text-primary neon-text mb-2">
            {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE GAME'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' 
              ? 'Login to save your high scores' 
              : 'Create an account to compete on the leaderboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 neon-border">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="SnakeMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="player@arcade.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? 'Loading...' 
                : mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button
            variant="link"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-neon-cyan"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </Button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
          <p className="text-xs text-center font-mono">
            Email: snake@example.com<br />
            Password: password
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
