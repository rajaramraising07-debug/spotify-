import { Track } from '../types';

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artist: 'Lazerhawk',
    album: 'Retro Future',
    duration: 372, // 6:12 - we will shorten or play as is
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Synthwave',
    lyrics: [
      { time: 0, text: '🎵 [Synth Instrumental Intro - Driving Beats] 🎵' },
      { time: 10, text: 'Cruising down the neon street' },
      { time: 16, text: 'Underneath the purple sky' },
      { time: 22, text: 'Feel the grid beneath our feet' },
      { time: 28, text: 'As the digital shadows fly' },
      { time: 34, text: 'We are running through the wire' },
      { time: 40, text: 'Sparking up a retro fire' },
      { time: 46, text: 'In this synthetic paradise' },
      { time: 52, text: 'Roll the digital, roll the dice!' },
      { time: 58, text: '🎵 [Synthesizer Solo - Rising Melody] 🎵' },
      { time: 70, text: 'Time is loops, and loops are time' },
      { time: 76, text: 'Singing in a perfect rhyme' },
      { time: 82, text: 'Can you hear the 80s call?' },
      { time: 88, text: 'Break the static, climb the wall' },
      { time: 94, text: '🎵 [Extended Electronic Solo - Neon Pulsing] 🎵' },
      { time: 120, text: 'We are running through the wire' },
      { time: 126, text: 'Sparking up a retro fire' },
      { time: 132, text: 'In this synthetic paradise' },
      { time: 138, text: 'Roll the digital, roll the dice!' }
    ],
    synthConfig: {
      tempo: 120,
      melody: [60, 62, 64, 67, 69, 67, 64, 62], // Pentatonic
      synthType: 'sawtooth',
      drumBeat: 'dance'
    }
  },
  {
    id: 'track-2',
    title: 'Midnight Coffee',
    artist: 'Coffee Beans',
    album: 'Lo-Fi Study Sessions',
    duration: 423,
    coverUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Lo-Fi',
    lyrics: [
      { time: 0, text: '☕ [Rain sounds and coffee shop atmosphere] ☕' },
      { time: 8, text: 'Steam rises from the paper cup' },
      { time: 15, text: 'Midnight clock is ticking slow' },
      { time: 22, text: 'Time to study, time to look up' },
      { time: 29, text: 'Watching headlights down below' },
      { time: 36, text: 'Chill beats in the background hum' },
      { time: 44, text: 'Tapping fingers, clicking pen' },
      { time: 51, text: 'Another page, another sum' },
      { time: 58, text: 'Here we are at three AM' },
      { time: 66, text: '🎵 [Smooth Saxophone Bridge - Lo-Fi Chill] 🎵' },
      { time: 85, text: 'Outside, the city goes to sleep' },
      { time: 92, text: 'But the coffee keeps me awake' },
      { time: 100, text: 'Promises we swore to keep' },
      { time: 107, text: 'For our future we will make' }
    ],
    synthConfig: {
      tempo: 80,
      melody: [57, 60, 64, 67, 69, 67, 64, 60],
      synthType: 'sine',
      drumBeat: 'chill'
    }
  },
  {
    id: 'track-3',
    title: 'Summer Breeze',
    artist: 'Ocean Waves',
    album: 'Island Chill',
    duration: 302,
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Acoustic / Chill',
    lyrics: [
      { time: 0, text: '🌊 [Ocean Waves Crashing - Acoustic Guitar Strumming] 🌊' },
      { time: 12, text: 'Sand in my shoes, sun on my face' },
      { time: 18, text: 'We are moving at a slower pace' },
      { time: 24, text: 'No schedules, no rush today' },
      { time: 30, text: 'Let the ocean wash it all away' },
      { time: 36, text: 'Summer breeze, carry me far' },
      { time: 42, text: 'Singing songs under the star' },
      { time: 48, text: 'With the acoustic chords in hand' },
      { time: 54, text: 'Scribbling names in the golden sand' },
      { time: 60, text: '🎵 [Warm Guitar Solo and Wave Swells] 🎵' },
      { time: 78, text: 'Take a deep breath, let it out' },
      { time: 84, text: 'What this season is all about' },
      { time: 90, text: 'Holding onto golden hours' },
      { time: 96, text: 'Fresh like wild coastal flowers' }
    ],
    synthConfig: {
      tempo: 100,
      melody: [62, 64, 66, 69, 71, 69, 66, 64],
      synthType: 'triangle',
      drumBeat: 'chill'
    }
  },
  {
    id: 'track-4',
    title: 'Cyberpunk Odyssey',
    artist: 'Grid Runner',
    album: 'Megacity Chronicles',
    duration: 502,
    coverUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Cyberpunk / Techno',
    lyrics: [
      { time: 0, text: '⚡ [Heavy Sub-Bass Drone - Glitching Synthesizers] ⚡' },
      { time: 15, text: 'Chrome and steel, cybernetic link' },
      { time: 21, text: 'Riding the grid, faster than you think' },
      { time: 27, text: 'In the shadows of the skyscraper wall' },
      { time: 33, text: 'We build an empire before we fall' },
      { time: 39, text: 'Data stream flowing in my head' },
      { time: 45, text: 'Sleeping in a virtual server bed' },
      { time: 51, text: 'Can you crack the system key?' },
      { time: 57, text: 'Break the code, set yourself free!' },
      { time: 63, text: '🎵 [Distorted Square Wave Bass Solo] 🎵' },
      { time: 85, text: 'Neon signs flickers in the dark' },
      { time: 91, text: 'Static lightning leaves a spark' },
      { time: 97, text: 'Megacity hums a metal tune' },
      { time: 103, text: 'Underneath the augmented moon' }
    ],
    synthConfig: {
      tempo: 130,
      melody: [48, 51, 53, 55, 58, 55, 53, 51], // Minor scale
      synthType: 'square',
      drumBeat: 'dance'
    }
  },
  {
    id: 'track-5',
    title: 'Echoes of Elysium',
    artist: 'Stargazer',
    album: 'Nebula Explorations',
    duration: 384,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Ambient / Space',
    lyrics: [
      { time: 0, text: '🌌 [Ethereal Celestial Pads - Zero Gravity Vibe] 🌌' },
      { time: 15, text: 'Floating in the great unknown' },
      { time: 24, text: 'Far away from our earthly home' },
      { time: 33, text: 'Sailing through a nebula bright' },
      { time: 42, text: 'Chasing waves of cosmic light' },
      { time: 51, text: 'No gravity, no heavy weights' },
      { time: 60, text: 'Opening up the stellar gates' },
      { time: 69, text: 'Echoes of a distant sun' },
      { time: 78, text: 'Where the universe is one' },
      { time: 87, text: '🎵 [Spacious Reverb Echoes and Soft Synth Swells] 🎵' }
    ],
    synthConfig: {
      tempo: 60,
      melody: [60, 64, 67, 71, 72, 71, 67, 64],
      synthType: 'sine',
      drumBeat: 'none'
    }
  },
  {
    id: 'track-6',
    title: 'Deep House Sunset',
    artist: 'Aura',
    album: 'Beach Club Anthems',
    duration: 341,
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'Deep House',
    lyrics: [
      { time: 0, text: '🕺 [Deep Bassline Kick - Hi-Hat Stabs] 🕺' },
      { time: 10, text: 'Sun goes down, music turns up' },
      { time: 16, text: 'Gold reflection in your glass' },
      { time: 22, text: 'Everybody raises their cup' },
      { time: 28, text: 'Hoping that the night will last' },
      { time: 34, text: 'Deep house bass, pumping low' },
      { time: 40, text: 'Watch the rhythm start to grow' },
      { time: 46, text: 'Swaying bodies in the breeze' },
      { time: 52, text: 'Lost in beachside melodies' },
      { time: 58, text: '🎵 [Funky Electronic Synth Solo] 🎵' },
      { time: 80, text: 'Can you feel the tempo rise?' },
      { time: 86, text: 'Looking deep into your eyes' },
      { time: 92, text: 'Dance along the coastal line' },
      { time: 98, text: 'Everything is feeling fine' }
    ],
    synthConfig: {
      tempo: 122,
      melody: [53, 56, 58, 60, 63, 60, 58, 56],
      synthType: 'triangle',
      drumBeat: 'dance'
    }
  },
  {
    id: 'track-tamil-1',
    title: 'Marakkuma Nenjam',
    artist: 'A.R. Rahman',
    album: 'Vendhu Thanindhathu Kaadu',
    duration: 254,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'Kollywood / Tamil',
    lyrics: [
      { time: 0, text: '🎵 [Ethereal flute intro and gentle hums] 🎵' },
      { time: 12, text: 'Marakkuma nenjam... Marakkuma nenjam...' },
      { time: 19, text: 'Tholaindha tholaindha megam thodudhey...' },
      { time: 26, text: 'Marakkuma nenjam... Thoduma vaanam?' },
      { time: 33, text: 'Irundha irundha kaadu vazhiyey...' },
      { time: 40, text: '🎵 [Swell of acoustic strings and keys] 🎵' },
      { time: 50, text: 'Yen idhayathin ninaivugalin sandhiranaaga' },
      { time: 57, text: 'Theriyum un mugam, un siripin oli...' },
      { time: 64, text: 'Marakkuma nenjam... Marakkuma nenjam...' }
    ],
    synthConfig: {
      tempo: 85,
      melody: [60, 63, 65, 67, 70, 72, 70, 67],
      synthType: 'sine',
      drumBeat: 'chill'
    }
  },
  {
    id: 'track-tamil-2',
    title: 'Arabic Kuthu',
    artist: 'Anirudh Ravichander, Jonita Gandhi',
    album: 'Beast',
    duration: 280,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    genre: 'Kollywood / Tamil',
    lyrics: [
      { time: 0, text: '🎵 [Energetic Arabian Beats and Oud Riff] 🎵' },
      { time: 10, text: 'Halamithi habibo... halamithi habibo...' },
      { time: 16, text: 'Halamithi habibo... sollu halamithi habibo!' },
      { time: 22, text: 'Malama pithadhri, oh kuthu paatu dhaan...' },
      { time: 28, text: 'Konjam kailasathil vachu kuthu kuthuna...' },
      { time: 34, text: '🎵 [Heavy Dance Bass drop and whistles] 🎵' },
      { time: 44, text: 'Beast mode-u on-u, thalaivar ready dhaan!' },
      { time: 50, text: 'Oru thadava paatha, un mind-u full-a dhaan...' },
      { time: 56, text: 'Halamithi habibo... halamithi habibo!' }
    ],
    synthConfig: {
      tempo: 128,
      melody: [58, 60, 61, 64, 65, 67, 69, 67],
      synthType: 'sawtooth',
      drumBeat: 'dance'
    }
  },
  {
    id: 'track-tamil-3',
    title: 'Why This Kolaveri Di',
    artist: 'Anirudh Ravichander, Dhanush',
    album: '3',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    genre: 'Kollywood / Tamil',
    lyrics: [
      { time: 0, text: '🎵 [Acoustic guitar strumming and simple counts] 🎵' },
      { time: 6, text: 'Yo boys... I am singing song...' },
      { time: 11, text: 'Soup song... Flop song... Love failure song...' },
      { time: 16, text: 'Why this kolaveri kolaveri kolaveri di?' },
      { time: 22, text: 'Why this kolaveri kolaveri kolaveri di?' },
      { time: 28, text: '🎵 [Rhythm starts - slow and steady bounce] 🎵' },
      { time: 35, text: 'Distance-la moon-u moon-u... Moon-u color-u white-u...' },
      { time: 41, text: 'White-u background night-u night-u... Night-u color-u black-u...' },
      { time: 47, text: 'Why this kolaveri kolaveri kolaveri di?' },
      { time: 53, text: 'Why this kolaveri kolaveri kolaveri di?' }
    ],
    synthConfig: {
      tempo: 90,
      melody: [62, 64, 66, 67, 69, 71, 74, 71],
      synthType: 'triangle',
      drumBeat: 'chill'
    }
  },
  {
    id: 'track-tamil-4',
    title: 'Neruppu Da (Kabali)',
    artist: 'Santhosh Narayanan, Arunraja Kamaraj',
    album: 'Kabali',
    duration: 218,
    coverUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    genre: 'Kollywood / Tamil',
    lyrics: [
      { time: 0, text: '🔥 [Sirens, guitar feedback, metal chugs] 🔥' },
      { time: 11, text: 'Neruppu da... nerungu da paappom...' },
      { time: 16, text: 'Sirusu da, kaattuna theri dhaan!' },
      { time: 21, text: 'Kabali da... thalaivar varu dhaan...' },
      { time: 26, text: 'Inge minnaladhaan, thala asaiya theri dhaan!' },
      { time: 31, text: '🔥 [Thundering drum rolls and metal distortion] 🔥' },
      { time: 42, text: 'Oru thadava sonna... nooru thadava dhaan!' },
      { time: 47, text: 'Simma ragam-u kettuko, bayam illai dhaan!' },
      { time: 52, text: 'Neruppu da... nerungu da paappom!' }
    ],
    synthConfig: {
      tempo: 140,
      melody: [57, 59, 60, 63, 64, 67, 68, 64],
      synthType: 'sawtooth',
      drumBeat: 'dance'
    }
  },
  {
    id: 'track-tamil-5',
    title: 'Aalaporaan Thamizhan',
    artist: 'A.R. Rahman, Kailash Kher',
    album: 'Mersal',
    duration: 342,
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    genre: 'Kollywood / Tamil',
    lyrics: [
      { time: 0, text: '🎵 [Traditional thavil, nadaswaram horns, festival crowd] 🎵' },
      { time: 12, text: 'Aalaporaan thamizhan ulagamellaam...' },
      { time: 18, text: 'Neththi pottil thottu vaippaan sandhanamellaam...' },
      { time: 24, text: 'Vaasapadhiyil vanthu nirkum magizhchiyellaam...' },
      { time: 30, text: 'Anbe namadhu veera parambara dhaan!' },
      { time: 36, text: '🎵 [High-pitched nadaswaram solo and drums] 🎵' },
      { time: 48, text: 'Muththaana muththaana naatukulle...' },
      { time: 54, text: 'Thangadha tharaiyilla nambalukke...' },
      { time: 60, text: 'Aalaporaan thamizhan ulagamellaam!' }
    ],
    synthConfig: {
      tempo: 110,
      melody: [60, 62, 64, 65, 67, 69, 71, 72],
      synthType: 'triangle',
      drumBeat: 'dance'
    }
  }
];
