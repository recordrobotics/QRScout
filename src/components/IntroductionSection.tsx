import { Info, Sparkles, Rocket } from 'lucide-react';
import packageJson from '../../package.json';

export function IntroductionSection() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20 mt-20 border-t border-primary/10 text-left bg-gradient-to-b from-transparent to-primary/5 rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Welcome Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <Info className="size-8" />
            <h2 className="text-3xl font-record-ns">About QRScout</h2>
          </div>
          <div className="flex flex-col gap-6 text-xl text-muted-foreground leading-relaxed">
            <p className="bg-background/50 p-4 rounded-xl border border-primary/5 shadow-sm">
              QRScout is a dynamic, <span className="text-secondary-foreground font-semibold">offline-first</span> scouting application
              designed for competitive robotics.
            </p>
            <p className="bg-background/50 p-4 rounded-xl border border-primary/5 shadow-sm">
              As you track matches, your data is converted directly into a
              secure <span className="text-primary font-semibold">QR code</span> OR synced directly to the <span className="text-primary font-semibold">cloud</span>.
            </p>
            <p className="bg-background/50 p-4 rounded-xl border border-primary/5 shadow-sm">
              This data can be managed instantly inside your
              team's master spreadsheet—no spotty stadium Wi-Fi required!
            </p>
          </div>
        </div>

        {/* Updates Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles className="size-8" />
            <h2 className="text-3xl font-record-ns">
              QRScout v{packageJson.version} Updates
            </h2>
          </div>
          <div className="flex flex-col gap-5 text-lg text-muted-foreground leading-relaxed">
            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                <div className="mt-1 size-2 bg-secondary rounded-full flex-shrink-0" />
                <p>
                  Added <strong className="text-secondary-foreground">Cloud Sync</strong> to instantly upload your offline match queue to Google Sheets.
                </p>
              </div>
              <div className="flex gap-4 items-start bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                <div className="mt-1 size-2 bg-secondary rounded-full flex-shrink-0" />
                <p>
                  Robust <strong className="text-secondary-foreground">Offline Queuing</strong> utilizing IndexedDB for data protection during connectivity loss.
                </p>
              </div>
              <div className="flex gap-4 items-start bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                <div className="mt-1 size-2 bg-secondary rounded-full flex-shrink-0" />
                <p>
                  Enhanced UI with a dedicated <strong className="text-secondary-foreground">Sync Button</strong> and real-time status indicators.
                </p>
              </div>
              <div className="flex gap-4 items-start bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                <div className="mt-1 size-2 bg-secondary rounded-full flex-shrink-0" />
                <p>
                  Updated <strong className="text-secondary-foreground">2026 Season Config</strong> with optimized field layout for the latest challenge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-10 border-t border-primary/10 text-center relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background px-6 text-primary">
          <Rocket className="size-12 animate-bounce" />
        </div>
        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          Ready to start scouting? Set your configuration above and hit the field!
        </p>
      </div>
    </div>
  );
}
