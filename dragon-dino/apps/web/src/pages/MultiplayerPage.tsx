import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Check, Copy } from 'lucide-react';
import { Navigation } from '@/components/landing/Navigation';

interface MockPlayer {
  username: string;
  ready: boolean;
  avatar: string;
}

export default function MultiplayerPage() {
  const { roomId } = useParams();
  const [joinCode, setJoinCode] = useState('');
  const [inRoom, setInRoom] = useState(!!roomId);
  const [copied, setCopied] = useState(false);

  const mockPlayers: MockPlayer[] = [
    { username: 'You', ready: true, avatar: 'YO' },
    { username: 'DragonSlayer99', ready: true, avatar: 'DS' },
    { username: 'SpeedRunner_X', ready: false, avatar: 'SR' },
  ];

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(roomId ?? 'ABC123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <Navigation />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <h1 className="mb-8 text-4xl font-bold">
          <span className="text-dragon-orange">Multiplayer</span> Races
        </h1>

        {!inRoom ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-dragon-gold" />
                  Create Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a new race room and invite up to 3 friends.
                </p>
                <Button variant="glow" className="w-full" onClick={() => setInRoom(true)}>
                  Create Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-dragon-orange" />
                  Join Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Enter a room code to join an existing race.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="uppercase"
                  />
                  <Button variant="outline" onClick={() => setInRoom(true)}>Join</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Room Lobby</CardTitle>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-secondary px-3 py-1 font-mono text-sm">
                    {roomId ?? 'ABC123'}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPlayers.map((player, i) => (
                  <motion.div
                    key={player.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 rounded-lg border border-white/5 bg-secondary/50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-dragon-orange to-dragon-red text-xs font-bold">
                      {player.avatar}
                    </div>
                    <span className="flex-1 font-medium">{player.username}</span>
                    <Badge variant={player.ready ? 'default' : 'secondary'}>
                      {player.ready ? 'Ready' : 'Waiting'}
                    </Badge>
                  </motion.div>
                ))}
                {mockPlayers.length < 4 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                    Waiting for players... ({mockPlayers.length}/4)
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="glow" className="flex-1">Ready Up</Button>
                <Button variant="outline" onClick={() => setInRoom(false)}>Leave</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
