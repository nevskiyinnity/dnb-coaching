export const coachMedia = {
  motivation: {
    type: 'youtube' as const,
    title: '30 sec motivatie boost',
    youtubeId: 'dQw4w9WgXcQ', // TODO: replace with your real video
  },
  plateau: {
    type: 'youtube' as const,
    title: 'Plateau doorbreken in 60 sec',
    youtubeId: 'a3Z7zEc7AXQ', // placeholder
  },
  congratulations: {
    type: 'youtube' as const,
    title: 'Gefeliciteerd – next level!',
    youtubeId: 'l482T0yNkeo', // placeholder
  },
};
export type CoachMediaKey = keyof typeof coachMedia;