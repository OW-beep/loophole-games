import type { ComponentType } from 'react';
import WhyDailyGamesTookOver from '@/components/blog/posts/why-daily-games-took-over';
import CloudGamingRealityCheck from '@/components/blog/posts/cloud-gaming-reality-check';
import EconomicsOfFreeToPlay from '@/components/blog/posts/economics-of-free-to-play';
import IndieGamesBoomAndBust from '@/components/blog/posts/indie-games-boom-and-bust';
import ReturnOfCouchCoOp from '@/components/blog/posts/return-of-couch-co-op';
import AiInGameDevelopment from '@/components/blog/posts/ai-in-game-development';
import BrowserGameRenaissance from '@/components/blog/posts/browser-game-renaissance';
import RetroRevivalPixelArt from '@/components/blog/posts/retro-revival-pixel-art';
import SpeedrunningGoesMainstream from '@/components/blog/posts/speedrunning-goes-mainstream';
import PsychologyOfOneMoreTry from '@/components/blog/posts/psychology-of-one-more-try';

export const POST_COMPONENTS: Record<string, ComponentType> = {
  'why-daily-games-took-over': WhyDailyGamesTookOver,
  'cloud-gaming-reality-check': CloudGamingRealityCheck,
  'economics-of-free-to-play': EconomicsOfFreeToPlay,
  'indie-games-boom-and-bust': IndieGamesBoomAndBust,
  'return-of-couch-co-op': ReturnOfCouchCoOp,
  'ai-in-game-development': AiInGameDevelopment,
  'browser-game-renaissance': BrowserGameRenaissance,
  'retro-revival-pixel-art': RetroRevivalPixelArt,
  'speedrunning-goes-mainstream': SpeedrunningGoesMainstream,
  'psychology-of-one-more-try': PsychologyOfOneMoreTry,
};
