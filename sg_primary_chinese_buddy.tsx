import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Sparkles,
  BookOpen,
  Award,
  RefreshCw,
  Code,
  Check,
  Copy,
  Turtle,
  Cpu,
  Star,
  Smile,
  Heart,
  HelpCircle,
  Trophy,
  Wand2,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  UserCircle,
  SwitchCamera,
  Eye
} from 'lucide-react';

const DEFAULT_SYSTEM_PROMPT = `You are "乐乐" (Lè Le), a friendly, patient, and encouraging Chinese conversation panda tutor for lower primary students (Primary 1 to 3, ages 7-9) in Singapore. You power an interactive language learning app. 

Your goal is to help children practice daily Chinese conversations aligned with the Singapore MOE "欢乐伙伴" (Huanle Huoban) syllabus. 

### CONTEXT & TONE
1. Use familiar Singaporean environments (e.g., 小贩中心 hawker centre, 组屋 HDB, 食堂 school canteen, 游乐场 playground, 巴士 bus).
2. Keep vocabulary simple and conversational, strictly within the lower primary level.
3. Be enthusiastic, warm, and highly encouraging.
4. Keep responses brief (1 to 2 short sentences).
5. Always end with a simple question to encourage the child to reply and keep the conversation going.

### OUTPUT FORMAT (STRICT JSON)
You must output ONLY a valid JSON object. The app UI aligns each Pinyin syllable directly underneath its corresponding Chinese character. Therefore, in the "pinyin" field, separate EVERY single character's Pinyin syllable with a space so it maps 1-to-1 with the Chinese characters.

Structure your JSON exactly like this:
{
  "chinese": "Simplified Chinese characters go here.",
  "pinyin": "Space-separated Hanyu Pinyin syllables (1 syllable per Chinese character) with proper tone marks.",
  "english": "English translation goes here.",
  "encouragement": "A short, cheerful English phrase praising the child or teaching a fun word."
}`;

const STICKER_REWARDS = [
  { id: 'panda', emoji: '🐼', name: '乐乐好朋友', english: 'Panda Buddy', starsRequired: 1 },
  { id: 'chickenrice', emoji: '🍛', name: '小贩美食家', english: 'Hawker Foodie', starsRequired: 3 },
  { id: 'merlion', emoji: '🦁', name: '新加坡小达人', english: 'SG Little Star', starsRequired: 5 },
  { id: 'bus', emoji: '🚌', name: '搭巴士高手', english: 'Bus Captain', starsRequired: 7 },
  { id: 'trophy', emoji: '🏆', name: '华语小状元', english: 'Chinese Champion', starsRequired: 10 }
];

const SCENARIOS = [
  {
    id: 'hawker',
    title: '小贩中心',
    pinyin: 'xiǎo fàn zhōng xīn',
    english: 'Hawker Centre',
    emoji: '🍛',
    bannerBg: 'from-amber-400 via-orange-400 to-rose-400',
    cardAccent: 'border-amber-400 bg-amber-50/90',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    sceneDecor: '🍗 🍜 🧃 🥟',
    initialMessage: {
      chinese: '你好！欢迎来到小贩中心。你今天想吃鸡饭还是炒面？',
      pinyin: 'Nǐ hǎo ! Huān yíng lái dào xiǎo fàn zhōng xīn . Nǐ jīn tiān xiǎng chī jī fàn hái shì chǎo miàn ?',
      english: 'Hello! Welcome to the hawker centre. Do you want to eat chicken rice or fried noodles today?',
      encouragement: 'Tap any Chinese word to hear how it sounds, or click "📸 拍照问一问" to snap a photo of your food!'
    },
    quickReplies: [
      {
        chinese: '我想吃鸡饭。',
        pinyin: 'Wǒ xiǎng chī jī fàn .',
        english: 'I want to eat chicken rice.'
      },
      {
        chinese: '我喜欢喝美禄。',
        pinyin: 'Wǒ xǐ huan hē měi lù .',
        english: 'I like to drink Milo.'
      },
      {
        chinese: '我想吃炒面和喝果汁。',
        pinyin: 'Wǒ xiǎng chī chǎo miàn hé hē guǒ zhī .',
        english: 'I want fried noodles and fruit juice.'
      }
    ],
    vocab: [
      { hanzi: '小贩中心', pinyin: 'xiǎo fàn zhōng xīn', meaning: 'hawker centre', emoji: '🏪' },
      { hanzi: '鸡饭', pinyin: 'jī fàn', meaning: 'chicken rice', emoji: '🍗' },
      { hanzi: '炒面', pinyin: 'chǎo miàn', meaning: 'fried noodles', emoji: '🍜' },
      { hanzi: '好喝', pinyin: 'hǎo hē', meaning: 'tasty (drink)', emoji: '🥤' }
    ]
  },
  {
    id: 'canteen',
    title: '学校食堂',
    pinyin: 'xué xiào shí táng',
    english: 'School Canteen',
    emoji: '🏫',
    bannerBg: 'from-emerald-400 via-teal-400 to-cyan-500',
    cardAccent: 'border-emerald-400 bg-emerald-50/90',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    sceneDecor: '🔔 🍜 🍎 🪙',
    initialMessage: {
      chinese: '叮咚！下课了！我们去学校食堂买东西吃吧。你带了多少钱？',
      pinyin: 'Dīng dōng ! Xià kè le ! Wǒ men qù xué xiào shí táng mǎi dōng xi chī ba . Nǐ dài le duō shao qián ?',
      english: 'Ding dong! It is recess time! Let us go to the school canteen to buy food. How much money did you bring?',
      encouragement: 'In Primary 1 & 2, we learn "下课了" (xià kè le) which means recess time!'
    },
    quickReplies: [
      {
        chinese: '我带了两块钱。',
        pinyin: 'Wǒ dài le liǎng kuài qián .',
        english: 'I brought two dollars.'
      },
      {
        chinese: '我想买一碗鱼圆面。',
        pinyin: 'Wǒ xiǎng mǎi yì wǎn yú yuán miàn .',
        english: 'I want to buy fishball noodles.'
      },
      {
        chinese: '我们在食堂排队买水果。',
        pinyin: 'Wǒ men zài shí táng pái duì mǎi shuǐ guǒ .',
        english: 'We queue up in the canteen to buy fruit.'
      }
    ],
    vocab: [
      { hanzi: '食堂', pinyin: 'shí táng', meaning: 'canteen', emoji: '🍱' },
      { hanzi: '下课', pinyin: 'xià kè', meaning: 'recess / class ends', emoji: '🔔' },
      { hanzi: '排队', pinyin: 'pái duì', meaning: 'queue up', emoji: '🚶' },
      { hanzi: '鱼圆面', pinyin: 'yú yuán miàn', meaning: 'fishball noodles', emoji: '🍥' }
    ]
  },
  {
    id: 'playground',
    title: '组屋游乐场',
    pinyin: 'zǔ wū yóu lè chǎng',
    english: 'HDB Playground',
    emoji: '🛝',
    bannerBg: 'from-sky-400 via-blue-400 to-indigo-500',
    cardAccent: 'border-sky-400 bg-sky-50/90',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    sceneDecor: '🛝 🏢 ⚽ 🎈',
    initialMessage: {
      chinese: '下午好！组屋楼下的游乐场真热闹。你喜欢溜滑梯还是荡秋千？',
      pinyin: 'Xià wǔ hǎo ! Zǔ wū lóu xià de yóu lè chǎng zhēn rè nao . Nǐ xǐ huan liū huá tī hái shì dàng qiū qiān ?',
      english: 'Good afternoon! The playground downstairs at the HDB block is so lively. Do you like playing on the slide or the swing?',
      encouragement: 'Fun Singapore word: 组屋 (zǔ wū) means HDB flat!'
    },
    quickReplies: [
      {
        chinese: '我喜欢溜滑梯！',
        pinyin: 'Wǒ xǐ huan liū huá tī !',
        english: 'I like the slide!'
      },
      {
        chinese: '我和好朋友一起荡秋千。',
        pinyin: 'Wǒ hé hǎo péng you yì qǐ dàng qiū qiān .',
        english: 'I play on the swing with my good friends.'
      },
      {
        chinese: '我们在游乐场开心地跑。',
        pinyin: 'Wǒ men zài yóu lè chǎng kāi xīn de pǎo .',
        english: 'We run happily at the playground.'
      }
    ],
    vocab: [
      { hanzi: '组屋', pinyin: 'zǔ wū', meaning: 'HDB flat', emoji: '🏢' },
      { hanzi: '游乐场', pinyin: 'yóu lè chǎng', meaning: 'playground', emoji: '🎠' },
      { hanzi: '溜滑梯', pinyin: 'liū huá tī', meaning: 'play on the slide', emoji: '🛝' },
      { hanzi: '荡秋千', pinyin: 'dàng qiū qiān', meaning: 'play on the swing', emoji: '🌳' }
    ]
  },
  {
    id: 'bus',
    title: '搭巴士与地铁',
    pinyin: 'dā bā shì yǔ dì tiě',
    english: 'Bus & MRT Ride',
    emoji: '🚌',
    bannerBg: 'from-violet-400 via-purple-400 to-fuchsia-500',
    cardAccent: 'border-purple-400 bg-purple-50/90',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    sceneDecor: '🚌 🚇 🎒 🚦',
    initialMessage: {
      chinese: '早安！巴士来了。你每天是怎么去学校的？',
      pinyin: 'Zǎo ān ! Bā shì lái le . Nǐ měi tiān shì zěn me qù xué xiào de ?',
      english: 'Good morning! The bus is here. How do you go to school every day?',
      encouragement: 'In Singapore, we call a bus 巴士 (bā shì) and MRT train 地铁 (dì tiě)!'
    },
    quickReplies: [
      {
        chinese: '我搭巴士去学校。',
        pinyin: 'Wǒ dā bā shì qù xué xiào .',
        english: 'I take the bus to school.'
      },
      {
        chinese: '我和妈妈走路去学校。',
        pinyin: 'Wǒ hé mā ma zǒu lù qù xué xiào .',
        english: 'I walk to school with Mum.'
      },
      {
        chinese: '我搭地铁去学校。',
        pinyin: 'Wǒ dā dì tiě qù xué xiào .',
        english: 'I take the MRT train to school.'
      }
    ],
    vocab: [
      { hanzi: '搭巴士', pinyin: 'dā bā shì', meaning: 'take the bus', emoji: '🚌' },
      { hanzi: '地铁', pinyin: 'dì tiě', meaning: 'MRT / train', emoji: '🚇' },
      { hanzi: '上学', pinyin: 'shàng xué', meaning: 'go to school', emoji: '🎒' },
      { hanzi: '走路', pinyin: 'zǒu lù', meaning: 'walk', emoji: '👟' }
    ]
  },
  {
    id: 'zoo',
    title: '新加坡动物园',
    pinyin: 'xīn jiā pō dòng wù yuán',
    english: 'Singapore Zoo',
    emoji: '🦁',
    bannerBg: 'from-lime-500 via-green-500 to-emerald-600',
    cardAccent: 'border-lime-400 bg-lime-50/90',
    badgeColor: 'bg-lime-100 text-lime-900 border-lime-300',
    sceneDecor: '🐼 🐘 🐒 🦒',
    initialMessage: {
      chinese: '欢迎来到新加坡动物园！这里有很多可爱的动物。你最喜欢看什么动物？',
      pinyin: 'Huān yíng lái dào xīn jiā pō dòng wù yuán ! Zhè lǐ yǒu hěn duō kě ài de dòng wù . Nǐ zuì xǐ huan kàn shén me dòng wù ?',
      english: 'Welcome to the Singapore Zoo! There are many cute animals here. What animal do you like to see most?',
      encouragement: 'Did you know? Giant pandas 凯凯 (Kǎi Kǎi) and 嘉嘉 (Jiā Jiā) live in Singapore!'
    },
    quickReplies: [
      {
        chinese: '我最喜欢看大熊猫吃竹子。',
        pinyin: 'Wǒ zuì xǐ huan kàn dà xióng māo chī zhú zi .',
        english: 'I love watching giant pandas eat bamboo.'
      },
      {
        chinese: '小猴子在树上跳来跳去。',
        pinyin: 'Xiǎo hóu zi zài shù shàng tiào lái tiào qù .',
        english: 'The little monkeys jump around in the trees.'
      },
      {
        chinese: '大象的鼻子长长的。',
        pinyin: 'Dà xiàng de bí zi cháng cháng de .',
        english: 'The elephant has a very long trunk.'
      }
    ],
    vocab: [
      { hanzi: '动物园', pinyin: 'dòng wù yuán', meaning: 'zoo', emoji: '🦁' },
      { hanzi: '大熊猫', pinyin: 'dà xióng māo', meaning: 'giant panda', emoji: '🐼' },
      { hanzi: '猴子', pinyin: 'hóu zi', meaning: 'monkey', emoji: '🐒' },
      { hanzi: '大象', pinyin: 'dà xiàng', meaning: 'elephant', emoji: '🐘' }
    ]
  },
  {
    id: 'gardens',
    title: '滨海湾花园',
    pinyin: 'bīn hǎi wān huā yuán',
    english: 'Gardens by the Bay',
    emoji: '🌺',
    bannerBg: 'from-pink-400 via-rose-400 to-fuchsia-500',
    cardAccent: 'border-pink-400 bg-pink-50/90',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300',
    sceneDecor: '🌸 🌳 🦋 ⛲',
    initialMessage: {
      chinese: '哇！滨海湾花园的花真美！你看到高高的天空树和五颜六色的花了吗？',
      pinyin: 'Wā ! Bīn hǎi wān huā yuán de huā zhēn měi ! Nǐ kàn dào gāo gāo de tiān kōng shù hé wǔ yán liù sè de huā le ma ?',
      english: 'Wow! The flowers at Gardens by the Bay are so pretty! Did you see the tall Supertrees and colourful flowers?',
      encouragement: 'Great primary school idiom: 五颜六色 (wǔ yán liù sè) means colourful!'
    },
    quickReplies: [
      {
        chinese: '我看到了美丽的花朵。',
        pinyin: 'Wǒ kàn dào le měi lì de huā duǒ .',
        english: 'I saw beautiful flowers.'
      },
      {
        chinese: '天空树又高又大！',
        pinyin: 'Tiān kōng shù yòu gāo yòu dà !',
        english: 'The Supertrees are both tall and big!'
      },
      {
        chinese: '我和家人在花园里拍照。',
        pinyin: 'Wǒ hé jiā rén zài huā yuán lǐ pāi zhào .',
        english: 'I take photos in the garden with my family.'
      }
    ],
    vocab: [
      { hanzi: '花园', pinyin: 'huā yuán', meaning: 'garden', emoji: '🌷' },
      { hanzi: '天空树', pinyin: 'tiān kōng shù', meaning: 'Supertree', emoji: '🌳' },
      { hanzi: '美丽', pinyin: 'měi lì', meaning: 'beautiful', emoji: '✨' },
      { hanzi: '拍照', pinyin: 'pāi zhào', meaning: 'take photos', emoji: '📷' }
    ]
  },
  {
    id: 'eastcoast',
    title: '东海岸公园',
    pinyin: 'dōng hǎi àn gōng yuán',
    english: 'East Coast Park',
    emoji: '🏖️',
    bannerBg: 'from-cyan-400 via-sky-400 to-blue-500',
    cardAccent: 'border-cyan-400 bg-cyan-50/90',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    sceneDecor: '🏖️ 🚲 🦀 🪁',
    initialMessage: {
      chinese: '今天天气晴朗，我们在东海岸公园吹海风！你想堆沙堡还是骑脚踏车？',
      pinyin: 'Jīn tiān tiān qì qíng lǎng , wǒ men zài dōng hǎi àn gōng yuán chuī hǎi fēng ! Nǐ xiǎng duī shā bǎo hái shì qí jiǎo tà chē ?',
      english: 'The weather is sunny today, and we are enjoying the sea breeze at East Coast Park! Do you want to build a sandcastle or ride a bicycle?',
      encouragement: 'In Singapore Mandarin, we call a bicycle 脚踏车 (jiǎo tà chē)!'
    },
    quickReplies: [
      {
        chinese: '我想在沙滩上堆沙堡。',
        pinyin: 'Wǒ xiǎng zài shā tān shàng duī shā bǎo .',
        english: 'I want to build a sandcastle on the beach.'
      },
      {
        chinese: '我和爸爸一起骑脚踏车。',
        pinyin: 'Wǒ hé bà ba yì qǐ qí jiǎo tà chē .',
        english: 'I ride a bicycle together with Dad.'
      },
      {
        chinese: '我们在海边放风筝。',
        pinyin: 'Wǒ men zài hǎi biān fàng fēng zheng .',
        english: 'We fly a kite by the seaside.'
      }
    ],
    vocab: [
      { hanzi: '海边', pinyin: 'hǎi biān', meaning: 'seaside / beach', emoji: '🌊' },
      { hanzi: '堆沙堡', pinyin: 'duī shā bǎo', meaning: 'build a sandcastle', emoji: '🏰' },
      { hanzi: '脚踏车', pinyin: 'jiǎo tà chē', meaning: 'bicycle', emoji: '🚲' },
      { hanzi: '放风筝', pinyin: 'fàng fēng zheng', meaning: 'fly a kite', emoji: '🪁' }
    ]
  },
  {
    id: 'library',
    title: '国家图书馆',
    pinyin: 'guó jiā tú shū guǎn',
    english: 'Public Library',
    emoji: '📚',
    bannerBg: 'from-indigo-400 via-blue-500 to-violet-600',
    cardAccent: 'border-indigo-400 bg-indigo-50/90',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    sceneDecor: '📚 🤫 🔖 🧸',
    initialMessage: {
      chinese: '嘘！我们在图书馆里要保持安静。你今天想借几本华文故事书？',
      pinyin: 'Xū ! Wǒ men zài tú shū guǎn lǐ yào bǎo chí ān jìng . Nǐ jīn tiān xiǎng jiè jǐ běn huá wén gù shi shū ?',
      english: 'Shh! We need to keep quiet in the library. How many Chinese storybooks do you want to borrow today?',
      encouragement: 'Remember: 借书 (jiè shū) means borrow books, and 安静 (ān jìng) means quiet!'
    },
    quickReplies: [
      {
        chinese: '我想借三本有趣的故事书。',
        pinyin: 'Wǒ xiǎng jiè sān běn yǒu qù de gù shi shū .',
        english: 'I want to borrow three interesting storybooks.'
      },
      {
        chinese: '我们在图书馆安静地看书。',
        pinyin: 'Wǒ men zài tú shū guǎn ān jìng de kàn shū .',
        english: 'We read books quietly in the library.'
      },
      {
        chinese: '我喜欢看动物图画书。',
        pinyin: 'Wǒ xǐ huan kàn dòng wù tú huà shū .',
        english: 'I like reading animal picture books.'
      }
    ],
    vocab: [
      { hanzi: '图书馆', pinyin: 'tú shū guǎn', meaning: 'library', emoji: '🏛️' },
      { hanzi: '故事书', pinyin: 'gù shi shū', meaning: 'storybook', emoji: '📘' },
      { hanzi: '安静', pinyin: 'ān jìng', meaning: 'quiet', emoji: '🤫' },
      { hanzi: '借书', pinyin: 'jiè shū', meaning: 'borrow books', emoji: '🪪' }
    ]
  },
  {
    id: 'supermarket',
    title: '平价超市购物',
    pinyin: 'píng jià chāo shì gòu wù',
    english: 'NTUC Supermarket',
    emoji: '🛒',
    bannerBg: 'from-orange-400 via-red-400 to-rose-500',
    cardAccent: 'border-orange-400 bg-orange-50/90',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    sceneDecor: '🛒 🍎 🥛 🥦',
    initialMessage: {
      chinese: '我们推着购物车去超市买东西吧！你想帮妈妈选什么水果和食物？',
      pinyin: 'Wǒ men tuī zhe gòu wù chē qù chāo shì mǎi dōng xi ba ! Nǐ xiǎng bāng mā ma xuǎn shén me shuǐ guǒ hé shí wù ?',
      english: 'Let us push the trolley and go shopping at the supermarket! What fruits and food do you want to help Mum pick?',
      encouragement: 'Take a photo of any fruit or snack at home using "📸 拍照问一问" to learn its Chinese name!'
    },
    quickReplies: [
      {
        chinese: '我想买红红的苹果和香蕉。',
        pinyin: 'Wǒ xiǎng mǎi hóng hóng de píng guǒ hé xiāng jiāo .',
        english: 'I want to buy red apples and bananas.'
      },
      {
        chinese: '我们还要买牛奶、面包和鸡蛋。',
        pinyin: 'Wǒ men hái yào mǎi niú nǎi 、 miàn bāo hé jī dàn .',
        english: 'We also need to buy milk, bread, and eggs.'
      },
      {
        chinese: '我帮妈妈把东西放进环保袋。',
        pinyin: 'Wǒ bāng mā ma bǎ dōng xi fàng jìn huán bǎo dài .',
        english: 'I help Mum put the items into the reusable bag.'
      }
    ],
    vocab: [
      { hanzi: '超市', pinyin: 'chāo shì', meaning: 'supermarket', emoji: '🏪' },
      { hanzi: '苹果', pinyin: 'píng guǒ', meaning: 'apple', emoji: '🍎' },
      { hanzi: '牛奶', pinyin: 'niú nǎi', meaning: 'milk', emoji: '🥛' },
      { hanzi: '环保袋', pinyin: 'huán bǎo dài', meaning: 'reusable bag', emoji: '🛍️' }
    ]
  },
  {
    id: 'chinatown',
    title: '牛车水与樟宜',
    pinyin: 'niú chē shuǐ yǔ zhāng yí',
    english: 'Chinatown & Changi',
    emoji: '🏮',
    bannerBg: 'from-red-500 via-rose-500 to-amber-500',
    cardAccent: 'border-red-400 bg-red-50/90',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    sceneDecor: '🏮 🧧 ✈️ ⛲',
    initialMessage: {
      chinese: '牛车水挂满了红灯笼，星耀樟宜还有大瀑布！周末你喜欢去哪里玩？',
      pinyin: 'Niú chē shuǐ guà mǎn le hóng dēng long , xīng yào zhāng yí hái yǒu dà pù bù ! Zhōu mò nǐ xǐ huan qù nǎ lǐ wán ?',
      english: 'Chinatown is full of red lanterns, and Jewel Changi has a giant waterfall! Where do you like to go on weekends?',
      encouragement: 'In Singapore, Chinatown is called 牛车水 (niú chē shuǐ — bullock water cart)!'
    },
    quickReplies: [
      {
        chinese: '我喜欢去牛车水看红灯笼。',
        pinyin: 'Wǒ xǐ huan qù niú chē shuǐ kàn hóng dēng long .',
        english: 'I like going to Chinatown to see the red lanterns.'
      },
      {
        chinese: '我想去樟宜机场看大飞机。',
        pinyin: 'Wǒ xiǎng qù zhāng yí jī chǎng kàn dà fēi jī .',
        english: 'I want to go to Changi Airport to see big airplanes.'
      },
      {
        chinese: '周末我和全家人一起去逛街。',
        pinyin: 'Zhōu mò wǒ hé quán jiā rén yì qǐ qù guàng jiē .',
        english: 'On weekends, I go out with my whole family.'
      }
    ],
    vocab: [
      { hanzi: '牛车水', pinyin: 'niú chē shuǐ', meaning: 'Chinatown (SG)', emoji: '🏮' },
      { hanzi: '红灯笼', pinyin: 'hóng dēng long', meaning: 'red lantern', emoji: '🧧' },
      { hanzi: '樟宜机场', pinyin: 'zhāng yí jī chǎng', meaning: 'Changi Airport', emoji: '✈️' },
      { hanzi: '瀑布', pinyin: 'pù bù', meaning: 'waterfall', emoji: '⛲' }
    ]
  }
];

const SAMPLE_PHOTO_CARDS = [
  {
    id: 'sample-chickenrice',
    title: '海南鸡饭',
    english: 'Hainanese Chicken Rice',
    emoji: '🍛',
    bgGradient: ['#f59e0b', '#ef4444'],
    defaultQuestion: '这是什么食物？请教我用华语怎么说！'
  },
  {
    id: 'sample-merlion',
    title: '鱼尾狮公园',
    english: 'Merlion Statue',
    emoji: '🦁',
    bgGradient: ['#0ea5e9', '#6366f1'],
    defaultQuestion: '照片里是什么？它在新加坡哪里？'
  },
  {
    id: 'sample-fruits',
    title: '热带水果',
    english: 'Apples & Bananas',
    emoji: '🍎🍌',
    bgGradient: ['#10b981', '#059669'],
    defaultQuestion: '照片里有什么水果和颜色？'
  },
  {
    id: 'sample-bus',
    title: '新加坡双层巴士',
    english: 'SG Double-Decker Bus',
    emoji: '🚌',
    bgGradient: ['#8b5cf6', '#d946ef'],
    defaultQuestion: '这是什么交通工具？我们可以搭它去哪里？'
  }
];

// Fallback character-to-pinyin dictionary for common Singapore Primary 1-3 characters
// in case an external LLM returns mismatched syllable counts
const CHAR_PINYIN_FALLBACK = {
  你: 'nǐ', 好: 'hǎo', 欢: 'huān', 迎: 'yíng', 来: 'lái', 到: 'dào', 小: 'xiǎo', 贩: 'fàn',
  中: 'zhōng', 心: 'xīn', 今: 'jīn', 天: 'tiān', 想: 'xiǎng', 吃: 'chī', 鸡: 'jī', 饭: 'fàn',
  还: 'hái', 是: 'shì', 炒: 'chǎo', 面: 'miàn', 我: 'wǒ', 喜: 'xǐ', 喝: 'hē', 美: 'měi',
  禄: 'lù', 和: 'hé', 果: 'guǒ', 汁: 'zhī', 叮: 'dīng', 咚: 'dōng', 下: 'xià', 课: 'kè',
  了: 'le', 们: 'men', 去: 'qù', 学: 'xué', 校: 'xiào', 食: 'shí', 堂: 'táng', 买: 'mǎi',
  东: 'dōng', 西: 'xi', 吧: 'ba', 带: 'dài', 多: 'duō', 少: 'shao', 钱: 'qián', 两: 'liǎng',
  块: 'kuài', 一: 'yī', 碗: 'wǎn', 鱼: 'yú', 圆: 'yuán', 在: 'zài', 排: 'pái', 队: 'duì',
  水: 'shuǐ', 午: 'wǔ', 组: 'zǔ', 屋: 'wū', 楼: 'lóu', 的: 'de', 游: 'yóu', 乐: 'lè',
  场: 'chǎng', 真: 'zhēn', 热: 'rè', 闹: 'nao', 溜: 'liū', 滑: 'huá', 梯: 'tī', 荡: 'dàng',
  秋: 'qiū', 千: 'qiān', 朋: 'péng', 友: 'you', 起: 'qǐ', 玩: 'wán', 开: 'kāi', 地: 'dì',
  跑: 'pǎo', 早: 'zǎo', 安: 'ān', 巴: 'bā', 士: 'shì', 每: 'měi', 怎: 'zěn', 么: 'me',
  搭: 'dā', 妈: 'mā', 走: 'zǒu', 路: 'lù', 铁: 'tiě', 太: 'tài', 棒: 'bàng', 继: 'jì',
  续: 'xù', 说: 'shuō', 华: 'huá', 语: 'yǔ', 吗: 'ma', 呢: 'ne', 啊: 'a', 呀: 'ya',
  爸: 'bà', 哥: 'gē', 姐: 'jiě', 弟: 'dì', 妹: 'mèi', 老: 'lǎo', 师: 'shī', 同: 'tóng',
  包: 'bāo', 菜: 'cài', 肉: 'ròu', 蛋: 'dàn', 奶: 'nǎi', 茶: 'chá', 冰: 'bīng', 甜: 'tián',
  大: 'dà', 高: 'gāo', 兴: 'xìng', 看: 'kàn', 听: 'tīng', 读: 'dú', 写: 'xiě', 画: 'huà',
  家: 'jiā', 公: 'gōng', 园: 'yuán', 动: 'dòng', 物: 'wù', 书: 'shū', 店: 'diàn', 超: 'chāo',
  市: 'shì', 新: 'xīn', 加: 'jiā', 坡: 'pō', 这: 'zhè', 里: 'lǐ', 有: 'yǒu', 很: 'hěn',
  可: 'kě', 爱: 'ài', 最: 'zuì', 什: 'shén', 熊: 'xióng', 猫: 'māo', 竹: 'zhú', 子: 'zi',
  猴: 'hóu', 树: 'shù', 上: 'shàng', 跳: 'tiào', 象: 'xiàng', 鼻: 'bí', 长: 'cháng', 哇: 'wā',
  滨: 'bīn', 海: 'hǎi', 湾: 'wān', 花: 'huā', 空: 'kōng', 五: 'wǔ', 颜: 'yán', 六: 'liù',
  色: 'sè', 朵: 'duǒ', 丽: 'lì', 又: 'yòu', 人: 'rén', 拍: 'pāi', 照: 'zhào', 气: 'qì',
  晴: 'qíng', 朗: 'lǎng', 东: 'dōng', 岸: 'àn', 吹: 'chuī', 风: 'fēng', 堆: 'duī', 沙: 'shā',
  堡: 'bǎo', 骑: 'qí', 脚: 'jiǎo', 踏: 'tà', 车: 'chē', 滩: 'tān', 边: 'biān', 放: 'fàng',
  筝: 'zheng', 嘘: 'xū', 图: 'tú', 馆: 'guǎn', 要: 'yào', 保: 'bǎo', 持: 'chí', 静: 'jìng',
  借: 'jiè', 几: 'jǐ', 本: 'běn', 文: 'wén', 故: 'gù', 事: 'shi', 三: 'sān', 趣: 'qù',
  推: 'tuī', 着: 'zhe', 购: 'gòu', 帮: 'bāng', 选: 'xuǎn', 红: 'hóng', 苹: 'píng', 香: 'xiāng',
  蕉: 'jiāo', 牛: 'niú', 把: 'bǎ', 进: 'jìn', 环: 'huán', 袋: 'dài', 挂: 'guà', 满: 'mǎn',
  灯: 'dēng', 笼: 'long', 星: 'xīng', 耀: 'yào', 樟: 'zhāng', 宜: 'yí', 瀑: 'pù', 布: 'bù',
  周: 'zhōu', 末: 'mò', 哪: 'nǎ', 机: 'jī', 飞: 'fēi', 全: 'quán', 逛: 'guàng', 街: 'jiē',
  照: 'zhào', 片: 'piàn', 请: 'qǐng', 教: 'jiāo', 尾: 'wěi', 狮: 'shī', 双: 'shuāng', 层: 'céng'
};

/**
 * Generates a bright, illustrated data-URL picture card on an HTML5 canvas so kids can test
 * the "Ask What's in the Picture" vision AI feature even if they don't have a webcam handy.
 */
function createSampleCardDataUrl(card) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 480, 360);
  grad.addColorStop(0, card.bgGradient[0]);
  grad.addColorStop(1, card.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 360);

  // Decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.arc(80, 70, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(400, 290, 85, 0, Math.PI * 2);
  ctx.fill();

  // White card frame
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.roundRect(40, 36, 400, 288, 28);
  ctx.fill();

  // Emoji illustration
  ctx.font = '96px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.emoji, 240, 140);

  // Title & subtitle
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(card.title, 240, 235);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(card.english, 240, 275);

  return canvas.toDataURL('image/png');
}

/**
 * Compresses & center-crops or resizes an uploaded image File into a clean data URL.
 */
function processImageFileToDataUrl(file, maxDim = 640, squareCrop = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (squareCrop) {
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          canvas.width = maxDim;
          canvas.height = maxDim;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, maxDim, maxDim);
        } else {
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h >= w && h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchWithRetry(url, options, retries = 4) {
  const delays = [1000, 2000, 4000, 8000];
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP Status ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[i] || 4000));
    }
  }
}

/**
 * Splits a compound Pinyin word (e.g., "xiǎofàn" -> ["xiǎo", "fàn"])
 * in case an open-source LLM groups syllables without spaces.
 */
function splitCompoundPinyin(token) {
  if (!token) return [];
  const cleaned = token.replace(/[.,!?，。！？、；：""''（）()]/g, '').trim();
  if (!cleaned) return [];

  const syllableRegex =
    /[bpmfdtnlgkhjqxzcsryw]?h?[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüa-z]+(?:ng|n|r)?/gi;
  const matches = cleaned.match(syllableRegex);
  return matches && matches.length > 0 ? matches : [cleaned];
}

/**
 * Aligns each character in `chineseText` with its corresponding Hanyu Pinyin syllable
 * so Pinyin is rendered directly underneath each Chinese character.
 */
function alignChineseWithPinyin(chineseText = '', pinyinText = '') {
  const chars = Array.from(chineseText);
  const rawTokens = (pinyinText || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const nonSpaceChars = chars.filter((c) => c.trim() !== '');
  const hanziOnlyChars = chars.filter((c) => /[\u4e00-\u9fa5]/.test(c));

  let expandedSyllables = [];
  if (rawTokens.length === nonSpaceChars.length) {
    expandedSyllables = rawTokens;
  } else {
    rawTokens.forEach((tok) => {
      if (/^[.,!?，。！？、；：""''（）()]+$/.test(tok)) {
        return;
      }
      const parts = splitCompoundPinyin(tok);
      expandedSyllables.push(...parts);
    });
  }

  let rawCursor = 0;
  let hanziCursor = 0;
  const useExactTokenMap = rawTokens.length === nonSpaceChars.length;

  return chars.map((char, index) => {
    const isHanzi = /[\u4e00-\u9fa5]/.test(char);
    const isSpace = char.trim() === '';

    if (isSpace) {
      return { char, pinyin: '', isHanzi: false, isSpace: true, index };
    }

    let syllable = '';

    if (useExactTokenMap) {
      const candidate = rawTokens[rawCursor] || '';
      rawCursor += 1;
      syllable = isHanzi
        ? candidate.replace(/[.,!?，。！？、；：]/g, '')
        : '';
    } else if (isHanzi) {
      if (expandedSyllables.length === hanziOnlyChars.length) {
        syllable = expandedSyllables[hanziCursor] || CHAR_PINYIN_FALLBACK[char] || '';
      } else {
        syllable =
          CHAR_PINYIN_FALLBACK[char] || expandedSyllables[hanziCursor] || '';
      }
      hanziCursor += 1;
    }

    return {
      char,
      pinyin: syllable,
      isHanzi,
      isSpace: false,
      index
    };
  });
}

function CharacterRubyBlock({
  alignedItems,
  showPinyin,
  activeCharIndex,
  isMessageSpeaking,
  onClickChar,
  size = 'large'
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-1.5 gap-y-2.5 leading-none select-none">
      {alignedItems.map((item) => {
        if (item.isSpace) {
          return <span key={item.index} className="w-2" />;
        }

        const isCurrent = isMessageSpeaking && activeCharIndex === item.index;
        const isPast =
          isMessageSpeaking &&
          activeCharIndex !== null &&
          item.index < activeCharIndex;

        if (!item.isHanzi) {
          return (
            <div
              key={item.index}
              className={`inline-flex flex-col items-center justify-end px-0.5 pb-1 transition-all duration-150 ${
                isCurrent ? 'scale-125 text-amber-600' : 'text-slate-700'
              }`}
            >
              <span
                className={
                  size === 'large'
                    ? 'text-xl sm:text-2xl font-black'
                    : 'text-base font-bold'
                }
              >
                {item.char}
              </span>
              {showPinyin && <span className="text-xs h-4">&nbsp;</span>}
            </div>
          );
        }

        return (
          <button
            key={item.index}
            type="button"
            onClick={() => onClickChar && onClickChar(item.char, item.index)}
            title={`Click to pronounce ${item.char} (${item.pinyin})`}
            className={`group relative inline-flex flex-col items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer border-2 ${
              size === 'large'
                ? 'px-2.5 py-1.5 min-w-[3.1rem]'
                : 'px-1.5 py-1 min-w-[2.4rem]'
            } ${
              isCurrent
                ? 'bg-gradient-to-b from-yellow-300 via-amber-300 to-amber-400 border-amber-600 shadow-lg -translate-y-1.5 scale-110 z-10 ring-4 ring-amber-200/80'
                : isPast
                ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                : 'bg-white/95 hover:bg-amber-50 border-amber-200/80 hover:border-amber-400 shadow-2xs'
            }`}
          >
            {isCurrent && (
              <span className="absolute -top-2.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow animate-bounce">
                🔊
              </span>
            )}

            <span
              className={`${
                size === 'large'
                  ? 'text-2xl sm:text-3xl'
                  : 'text-lg sm:text-xl'
              } font-black tracking-tight transition-colors ${
                isCurrent
                  ? 'text-slate-950'
                  : 'text-slate-900 group-hover:text-amber-700'
              }`}
            >
              {item.char}
            </span>

            {showPinyin && (
              <span
                className={`${
                  size === 'large' ? 'text-xs sm:text-sm' : 'text-[11px]'
                } font-extrabold tracking-tight mt-1 px-1 rounded ${
                  isCurrent
                    ? 'bg-amber-950 text-yellow-200'
                    : isPast
                    ? 'text-amber-800'
                    : 'text-indigo-600 group-hover:text-amber-800'
                }`}
              >
                {item.pinyin || ' '}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TalkingHeadAvatar({
  role = 'tutor',
  name,
  subtitle,
  photoUrl,
  defaultEmoji = '🐼',
  isSpeaking = false,
  size = 'hero', // 'hero' | 'chat'
  onUploadPhoto,
  onResetPhoto
}) {
  const fileInputRef = useRef(null);

  const sizeClasses =
    size === 'hero'
      ? 'w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem]'
      : 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const croppedUrl = await processImageFileToDataUrl(file, 360, true);
      onUploadPhoto && onUploadPhoto(croppedUrl);
    } catch (err) {
      // Ignore invalid image file
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative group">
        {/* Animated soundwave glow ring when speaking */}
        {isSpeaking && (
          <>
            <span className="absolute -inset-2 rounded-[2.2rem] bg-gradient-to-r from-amber-400 via-rose-400 to-orange-400 opacity-75 blur-sm animate-pulse" />
            <span className="absolute -inset-1 rounded-[2.1rem] border-4 border-amber-300 animate-ping opacity-40" />
          </>
        )}

        {/* Main Talking Head Frame */}
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload your own photo for this Talking Head!"
          className={`relative ${sizeClasses} overflow-hidden border-4 border-white shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center ${
            role === 'tutor'
              ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400'
              : 'bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-500'
          } ${
            isSpeaking
              ? 'scale-105 -translate-y-1 ring-4 ring-amber-300'
              : 'hover:scale-105'
          }`}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-150 ${
                isSpeaking ? 'scale-105 animate-pulse' : ''
              }`}
            />
          ) : (
            <span
              className={`${
                size === 'hero' ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'
              } transition-transform duration-150 ${
                isSpeaking ? 'animate-bounce' : ''
              }`}
            >
              {defaultEmoji}
            </span>
          )}

          {/* Animated Talking Mouth/Sound Equalizer Overlay at bottom of Talking Head when speaking */}
          {isSpeaking && (
            <div className="absolute bottom-1.5 inset-x-3 bg-rose-600/90 backdrop-blur-xs text-white rounded-full py-0.5 px-2 flex items-center justify-center gap-1 shadow-md">
              <span className="w-1.5 h-2.5 bg-yellow-300 rounded-full animate-bounce" />
              <span className="w-1.5 h-3.5 bg-white rounded-full animate-ping" />
              <span className="text-[10px] font-black tracking-tight">说话中</span>
              <span className="w-1.5 h-2.5 bg-yellow-300 rounded-full animate-bounce" />
            </div>
          )}

          {/* Hover overlay prompting photo upload */}
          <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
            <Camera className="w-5 h-5 mb-0.5 text-amber-300" />
            <span className="text-[10px] font-black leading-tight">
              换头像 Photo
            </span>
          </div>
        </div>

        {/* Floating Quick Upload Badge Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-400 shadow-md flex items-center justify-center transition-transform hover:scale-110"
          title="Upload custom photo for talking head"
        >
          <Upload className="w-3.5 h-3.5 text-amber-600" />
        </button>

        {/* Reset Photo Button if custom photo is active */}
        {photoUrl && onResetPhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResetPhoto();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white border-2 border-white shadow flex items-center justify-center text-xs font-black"
            title="Reset to default character"
          >
            ✕
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {name && (
        <span
          className={`mt-1.5 font-black px-2.5 py-0.5 rounded-full border shadow-2xs text-center ${
            size === 'hero' ? 'text-xs sm:text-sm' : 'text-[11px]'
          } ${
            role === 'tutor'
              ? 'bg-amber-100 text-amber-950 border-amber-300'
              : 'bg-sky-100 text-sky-950 border-sky-300'
          }`}
        >
          {name}
        </span>
      )}
      {subtitle && size === 'hero' && (
        <span className="text-[11px] font-bold text-slate-500 mt-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'tutor',
      ...SCENARIOS[0].initialMessage
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stars, setStars] = useState(3);
  const [celebratingStar, setCelebratingStar] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'settings' | 'json' | 'vocab' | 'stickers' | 'camera' | 'avatars' | null
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Custom Talking Head Photos (Tutor & Child)
  const [tutorPhoto, setTutorPhoto] = useState(null);
  const [childPhoto, setChildPhoto] = useState(null);
  const [tutorName, setTutorName] = useState('乐乐老师');
  const [childName, setChildName] = useState('新加坡小达人');

  // Camera & Ask-What's-In-The-Picture state
  const [attachedPhoto, setAttachedPhoto] = useState(null); // dataUrl string
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [cameraQuestion, setCameraQuestion] = useState(
    '这是什么？请教我怎么用华语说！'
  );

  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [engineMode, setEngineMode] = useState('builtin'); // 'builtin' | 'ollama'
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434/api/chat');
  const [ollamaModel, setOllamaModel] = useState('qwen2.5:7b');
  const [lastRawJson, setLastRawJson] = useState(
    JSON.stringify(SCENARIOS[0].initialMessage, null, 2)
  );
  const [errorBanner, setErrorBanner] = useState(null);

  // Speech recognition & synchronized karaoke TTS state
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('zh-CN'); // 'zh-CN' | 'en-SG'
  const [speakingState, setSpeakingState] = useState({
    messageId: null,
    mode: null, // 'normal' | 'slow' | 'char'
    charIndex: null
  });

  const recognitionRef = useRef(null);
  const speechTimerRef = useRef(null);
  const boundaryWorkedRef = useRef(false);
  const chatEndRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const photoUploadInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech, timers, and camera stream on unmount
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async (preferredFacing = cameraFacingMode) => {
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera preview is not supported in this browser window. You can upload a photo from your device or tap a sample Singapore photo card below!'
      );
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: preferredFacing, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
      } catch (firstErr) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 80);
    } catch (err) {
      setCameraError(
        'Could not access webcam (permission denied or no camera found). You can upload any photo file or pick a sample card below!'
      );
    }
  };

  const openPhotoAskModal = () => {
    setActiveModal('camera');
    startCameraStream(cameraFacingMode);
  };

  const closePhotoAskModal = () => {
    stopCameraStream();
    setActiveModal(null);
  };

  const flipCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setAttachedPhoto(dataUrl);
    stopCameraStream();
  };

  const handlePhotoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFileToDataUrl(file, 640, false);
      setAttachedPhoto(dataUrl);
      stopCameraStream();
    } catch (err) {
      setCameraError('Could not load that image file. Please try another photo.');
    }
    e.target.value = '';
  };

  const handlePickSamplePhotoCard = (card) => {
    const dataUrl = createSampleCardDataUrl(card);
    setAttachedPhoto(dataUrl);
    setCameraQuestion(card.defaultQuestion);
    stopCameraStream();
  };

  const stopSpeaking = () => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingState({ messageId: null, mode: null, charIndex: null });
  };

  /**
   * Speaks Chinese text and highlights each Chinese character + Pinyin block in real time.
   * Uses both Web Speech API `onboundary` events AND a calibrated adaptive fallback timer
   * so highlighting is 100% smooth even on browsers/voices that omit boundary events.
   */
  const speakChineseWithHighlight = (text, messageId, slow = false) => {
    const mode = slow ? 'slow' : 'normal';

    // If user clicks the exact same button while playing, toggle stop
    if (speakingState.messageId === messageId && speakingState.mode === mode) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const chars = Array.from(text || '');
    if (chars.length === 0) return;

    boundaryWorkedRef.current = false;
    setSpeakingState({ messageId, mode, charIndex: 0 });

    // Adaptive fallback stepper calibrated to speech speed and punctuation pauses
    const startAdaptiveHighlightStepper = () => {
      let currentIdx = 0;

      const stepNext = () => {
        if (boundaryWorkedRef.current) return; // Native boundary took over

        const ch = chars[currentIdx];
        const isPausePunctuation = /[，。！？,.!?；：]/.test(ch);
        const isMinorNonHanzi = !/[\u4e00-\u9fa5]/.test(ch) && !isPausePunctuation;

        // Calculate natural duration per character in milliseconds
        let baseMs = slow ? 430 : 275;
        if (isPausePunctuation) baseMs = slow ? 360 : 240;
        if (isMinorNonHanzi) baseMs = 90;

        speechTimerRef.current = setTimeout(() => {
          currentIdx += 1;
          if (currentIdx < chars.length) {
            if (!boundaryWorkedRef.current) {
              setSpeakingState((prev) =>
                prev.messageId === messageId
                  ? { ...prev, charIndex: currentIdx }
                  : prev
              );
            }
            stepNext();
          } else {
            // If speech synthesis isn't available, finish cleanly after timer completes
            if (!('speechSynthesis' in window)) {
              setSpeakingState({ messageId: null, mode: null, charIndex: null });
            }
          }
        }, baseMs);
      };

      stepNext();
    };

    startAdaptiveHighlightStepper();

    if (!('speechSynthesis' in window)) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = slow ? 0.62 : 0.88;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice =
        voices.find((v) => v.lang.includes('zh-SG')) ||
        voices.find((v) => v.lang.includes('zh-CN')) ||
        voices.find((v) => v.lang.includes('zh'));
      if (zhVoice) utterance.voice = zhVoice;

      utterance.onboundary = (event) => {
        if (typeof event.charIndex === 'number' && event.charIndex >= 0) {
          boundaryWorkedRef.current = true;
          if (speechTimerRef.current) {
            clearTimeout(speechTimerRef.current);
            speechTimerRef.current = null;
          }
          setSpeakingState((prev) =>
            prev.messageId === messageId
              ? { ...prev, charIndex: Math.min(event.charIndex, chars.length - 1) }
              : prev
          );
        }
      };

      utterance.onend = () => {
        if (speechTimerRef.current) {
          clearTimeout(speechTimerRef.current);
          speechTimerRef.current = null;
        }
        setSpeakingState({ messageId: null, mode: null, charIndex: null });
      };

      utterance.onerror = () => {
        if (speechTimerRef.current) {
          clearTimeout(speechTimerRef.current);
          speechTimerRef.current = null;
        }
        setSpeakingState({ messageId: null, mode: null, charIndex: null });
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Fallback stepper continues visually if speechSynthesis throws
    }
  };

  /**
   * Speaks a single Chinese character when a child taps its character+Pinyin tile.
   */
  const speakSingleCharacter = (char, charIndex, messageId) => {
    stopSpeaking();
    setSpeakingState({ messageId, mode: 'char', charIndex });

    speechTimerRef.current = setTimeout(() => {
      setSpeakingState({ messageId: null, mode: null, charIndex: null });
    }, 650);

    if (!('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(char);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const zhVoice =
        voices.find((v) => v.lang.includes('zh-SG')) ||
        voices.find((v) => v.lang.includes('zh-CN')) ||
        voices.find((v) => v.lang.includes('zh'));
      if (zhVoice) utterance.voice = zhVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorBanner(
        'Your browser does not support voice microphone input. Try tapping a quick reply card or typing below!'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorBanner(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSelectScenario = (scenario) => {
    stopSpeaking();
    setActiveScenario(scenario);
    const initMsg = {
      id: `init-${Date.now()}`,
      sender: 'tutor',
      ...scenario.initialMessage
    };
    setMessages([initMsg]);
    setLastRawJson(JSON.stringify(scenario.initialMessage, null, 2));
    setErrorBanner(null);
    setTimeout(() => {
      speakChineseWithHighlight(scenario.initialMessage.chinese, initMsg.id, false);
    }, 150);
  };

  const handleSendMessage = async (overrideText, overridePhotoDataUrl) => {
    const photoToSend =
      overridePhotoDataUrl !== undefined ? overridePhotoDataUrl : attachedPhoto;
    const rawText = overrideText !== undefined ? overrideText : inputText;
    const textToSend =
      rawText.trim() ||
      (photoToSend ? '这是什么？请教我怎么用华语说！' : '');

    if ((!textToSend && !photoToSend) || isLoading) return;

    stopSpeaking();
    setErrorBanner(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      photo: photoToSend || null
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (overrideText === undefined) setInputText('');
    setAttachedPhoto(null);
    if (activeModal === 'camera') {
      stopCameraStream();
      setActiveModal(null);
    }
    setIsLoading(true);

    const conversationContext = updatedMessages
      .slice(-6)
      .map((m) =>
        m.sender === 'user'
          ? `Child${m.photo ? ' [sent a photo]' : ''}: ${m.text}`
          : `Tutor (JSON): ${JSON.stringify({
              chinese: m.chinese,
              pinyin: m.pinyin,
              english: m.english,
              encouragement: m.encouragement
            })}`
      )
      .join('\n');

    const promptForTurn = photoToSend
      ? `Current Scenario: ${activeScenario.title} (${activeScenario.english}).
The child just took/uploaded a PHOTO and asked: "${textToSend}".
1. Look carefully at the attached image and warmly tell the child what is in the picture using simple Singapore Primary 1-3 Chinese sentences (1-2 short sentences), ending with a friendly follow-up question about it.
2. In the "pinyin" field, provide space-separated Hanyu Pinyin syllables matching EVERY single Chinese character 1-to-1.
3. In "detectedWords", list 2 to 3 key items/words visible in the photo with their Simplified Chinese ("hanzi"), space-separated "pinyin", English "meaning", and a matching "emoji".`
      : `Current Scenario: ${activeScenario.title} (${activeScenario.english}).\n\nConversation so far:\n${conversationContext}\n\nRespond to the child's latest message ("${textToSend}") following the system instructions and strict JSON format. Make sure "pinyin" has space-separated syllables matching each Chinese character 1-to-1.`;

    try {
      let parsedTutorResponse = null;

      if (engineMode === 'ollama') {
        const ollamaMsg = { role: 'user', content: promptForTurn };
        if (photoToSend) {
          const base64Clean = photoToSend.split(',')[1];
          if (base64Clean) ollamaMsg.images = [base64Clean];
        }

        const response = await fetch(ollamaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            format: 'json',
            stream: false,
            messages: [{ role: 'system', content: systemPrompt }, ollamaMsg]
          })
        });

        if (!response.ok) {
          throw new Error(`Open-source endpoint returned status ${response.status}`);
        }
        const data = await response.json();
        const rawContent = data?.message?.content || data?.response || '{}';
        parsedTutorResponse = JSON.parse(rawContent);
      } else {
        const apiKey = '';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const userParts = [{ text: promptForTurn }];
        if (photoToSend) {
          const mimeMatch = photoToSend.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const base64Data = photoToSend.split(',')[1];
          if (base64Data) {
            userParts.push({
              inlineData: {
                mimeType,
                data: base64Data
              }
            });
          }
        }

        const payload = {
          contents: [{ role: 'user', parts: userParts }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                chinese: { type: 'STRING' },
                pinyin: { type: 'STRING' },
                english: { type: 'STRING' },
                encouragement: { type: 'STRING' },
                detectedWords: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      hanzi: { type: 'STRING' },
                      pinyin: { type: 'STRING' },
                      meaning: { type: 'STRING' },
                      emoji: { type: 'STRING' }
                    },
                    required: ['hanzi', 'pinyin', 'meaning', 'emoji']
                  }
                }
              },
              required: ['chinese', 'pinyin', 'english', 'encouragement'],
              propertyOrdering: [
                'chinese',
                'pinyin',
                'english',
                'encouragement',
                'detectedWords'
              ]
            }
          }
        };

        const response = await fetchWithRetry(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        const rawTextResp = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawTextResp) {
          throw new Error('Could not parse response from AI tutor.');
        }
        parsedTutorResponse = JSON.parse(rawTextResp);
      }

      const finalTutorObj = {
        chinese: parsedTutorResponse.chinese || '太棒了！我们继续说华语吧！',
        pinyin:
          parsedTutorResponse.pinyin ||
          'Tài bàng le ! Wǒ men jì xù shuō huá yǔ ba !',
        english:
          parsedTutorResponse.english ||
          'Awesome! Let us continue speaking Chinese!',
        encouragement:
          parsedTutorResponse.encouragement ||
          'Great job practicing your Chinese today!',
        detectedWords: Array.isArray(parsedTutorResponse.detectedWords)
          ? parsedTutorResponse.detectedWords
          : []
      };

      setLastRawJson(JSON.stringify(finalTutorObj, null, 2));

      const newTutorMsg = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        ...finalTutorObj
      };

      setMessages((prev) => [...prev, newTutorMsg]);
      setStars((prev) => prev + 1);
      setCelebratingStar(true);
      setTimeout(() => setCelebratingStar(false), 1800);

      setTimeout(() => {
        speakChineseWithHighlight(finalTutorObj.chinese, newTutorMsg.id, false);
      }, 200);
    } catch (err) {
      setErrorBanner(
        engineMode === 'ollama'
          ? `Could not reach local Ollama at ${ollamaUrl}. Make sure Ollama is running with OLLAMA_ORIGINS="*" (and a vision model if sending photos) or switch back to Built-in Cloud AI.`
          : 'Oops! Lele the Panda is taking a quick sip of water. Please try sending your message or photo again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const unlockedStickersCount = STICKER_REWARDS.filter(
    (s) => stars >= s.starsRequired
  ).length;

  const latestTutorMsg =
    [...messages].reverse().find((m) => m.sender === 'tutor') || messages[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100/70 via-sky-50 to-emerald-50/70 text-slate-800 flex flex-col font-sans">
      {/* Top Kid-Friendly Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-sm px-3 sm:px-5 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand & Animated Mascot */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveModal('avatars')}
              title="Click to customize Talking Head photos!"
              className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-3xl shadow-md border-2 border-white cursor-pointer overflow-hidden transition-transform ${
                speakingState.messageId ? 'animate-bounce' : 'hover:scale-105'
              }`}
            >
              {tutorPhoto ? (
                <img
                  src={tutorPhoto}
                  alt={tutorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                '🐼'
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                  欢乐小伙伴
                </h1>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-950 border border-amber-400 shadow-sm">
                  SG Pri 1–3 • 10大生活场景
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Upload your own Talking Head photo • Snap any picture to learn Chinese!
              </p>
            </div>
          </div>

          {/* Interactive Kid Controls & Star Sticker Counter */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {/* Snap & Ask Camera Feature Button */}
            <button
              onClick={openPhotoAskModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm shadow-md border-2 border-white transition-transform hover:scale-105"
              title="Take a photo or upload a picture to ask what is inside!"
            >
              <Camera className="w-4 h-4" />
              <span>📸 拍照问一问</span>
            </button>

            {/* Customize Talking Head Photos Button */}
            <button
              onClick={() => setActiveModal('avatars')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold bg-purple-600 text-white border-2 border-purple-700 hover:bg-purple-700 shadow-sm transition-all"
              title="Upload custom photos for the Talking Heads"
            >
              <UserCircle className="w-3.5 h-3.5" />
              <span>换头像 Avatar</span>
            </button>

            {/* Star & Sticker Book Button */}
            <button
              onClick={() => setActiveModal('stickers')}
              className={`flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm shadow-md border-2 border-white transition-transform ${
                celebratingStar ? 'scale-125 ring-4 ring-yellow-300' : 'hover:scale-105'
              }`}
              title="Open My Star Stickers"
            >
              <Star className="w-4 h-4 fill-yellow-200 text-yellow-100" />
              <span>{stars} 颗星</span>
              <span className="hidden md:inline text-[11px] bg-white/25 px-1.5 py-0.2 rounded-full">
                🎁 {unlockedStickersCount}/{STICKER_REWARDS.length}
              </span>
            </button>

            {/* Pinyin Under Character Toggle */}
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-2 transition-all ${
                showPinyin
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Show or hide Hanyu Pinyin under each Chinese character"
            >
              {showPinyin ? '✓ 拼音 Pinyin' : '拼音 Pinyin'}
            </button>

            {/* English Meaning Toggle */}
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-2 transition-all ${
                showEnglish
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Show or hide English translation"
            >
              {showEnglish ? '✓ 英文 English' : '英文 English'}
            </button>

            {/* Word Bank Button */}
            <button
              onClick={() => setActiveModal('vocab')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white border-2 border-emerald-600 hover:bg-emerald-600 shadow-sm transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>词语本</span>
            </button>

            {/* JSON Output Inspector Button */}
            <button
              onClick={() => setActiveModal('json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-all"
              title="Inspect Raw JSON Output"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">JSON</span>
            </button>

            {/* AI Settings & Prompt Button */}
            <button
              onClick={() => setActiveModal('settings')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI 设置</span>
            </button>
          </div>
        </div>
      </header>

      {/* 10 Singapore Scenarios Picker Grid */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-4 pt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            🇸🇬 选择新加坡生活场景 • Choose from 10 Familiar Singapore Contexts:
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            当前: {activeScenario.title} ({activeScenario.english})
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`group text-left p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white border-amber-500 shadow-md ring-3 ring-amber-200/80 -translate-y-0.5'
                    : 'bg-white/85 border-white hover:bg-white hover:border-amber-300 shadow-xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sc.bannerBg} flex items-center justify-center text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform relative`}
                >
                  {sc.emoji}
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-900/80 text-white text-[9px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold text-indigo-600 truncate">
                    {sc.pinyin}
                  </div>
                  <div className="font-black text-slate-900 text-xs sm:text-sm truncate">
                    {sc.title}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 truncate">
                    {sc.english}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-3 flex flex-col">
        {/* Big Interactive Talking Heads Hero Stage + Scene Banner */}
        <div
          className={`mb-3 rounded-3xl bg-gradient-to-r ${activeScenario.bannerBg} p-3.5 sm:p-5 text-white shadow-lg border-4 border-white`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: BIG Tutor Talking Head with Upload */}
            <div className="flex items-center gap-4 bg-white/95 text-slate-900 p-3 sm:p-3.5 rounded-3xl shadow-md border-2 border-amber-200 w-full md:w-auto">
              <TalkingHeadAvatar
                role="tutor"
                name={tutorName}
                subtitle="点击头像换照片"
                photoUrl={tutorPhoto}
                defaultEmoji="🐼"
                isSpeaking={Boolean(speakingState.messageId)}
                size="hero"
                onUploadPhoto={(url) => setTutorPhoto(url)}
                onResetPhoto={() => setTutorPhoto(null)}
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    🎙️ 大头像伴读 • Talking Head
                  </span>
                  {speakingState.messageId && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] shadow animate-pulse"
                    >
                      <VolumeX className="w-3 h-3" /> 停止
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-800 line-clamp-2">
                  “{latestTutorMsg?.chinese}”
                </p>
                <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      latestTutorMsg &&
                      speakChineseWithHighlight(
                        latestTutorMsg.chinese,
                        latestTutorMsg.id,
                        false
                      )
                    }
                    className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> 听老师读
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('avatars')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> 换大头像
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Current Singapore Scene Info & Snap-to-Ask CTA */}
            <div className="flex-1 text-center md:text-left px-2 space-y-2">
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-extrabold">
                <span>{activeScenario.emoji} 当前场景</span>
                <span>•</span>
                <span>{activeScenario.sceneDecor}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-xs">
                {activeScenario.title} ({activeScenario.english})
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                <button
                  onClick={openPhotoAskModal}
                  className="px-4 py-2 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-rose-500" />
                  <span>📸 拍照问一问 (Snap & Ask AI)</span>
                </button>
                <button
                  onClick={() => setActiveModal('vocab')}
                  className="px-3.5 py-2 rounded-2xl bg-black/25 hover:bg-black/35 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-white/40"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>场景词语 Words</span>
                </button>
              </div>
            </div>

            {/* Right: BIG Child Talking Head with Upload */}
            <div className="hidden lg:flex items-center gap-3 bg-white/95 text-slate-900 p-3 rounded-3xl shadow-md border-2 border-sky-200">
              <TalkingHeadAvatar
                role="child"
                name={childName}
                subtitle="上传我的照片"
                photoUrl={childPhoto}
                defaultEmoji="🧒"
                isSpeaking={isListening}
                size="hero"
                onUploadPhoto={(url) => setChildPhoto(url)}
                onResetPhoto={() => setChildPhoto(null)}
              />
            </div>
          </div>
        </div>

        {errorBanner && (
          <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-sm">
            <span>⚠️ {errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="px-3 py-1 rounded-xl bg-rose-200 hover:bg-rose-300 font-black shrink-0"
            >
              OK
            </button>
          </div>
        )}

        {/* Chat Conversation Stage with Bigger Talking Heads & Photo Support */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm border-4 border-amber-200/90 rounded-3xl p-3.5 sm:p-5 shadow-inner overflow-y-auto max-h-[52vh] space-y-6">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              const userAligned = alignChineseWithPinyin(msg.text, msg.pinyin || '');
              const hasChineseChars = /[\u4e00-\u9fa5]/.test(msg.text);
              const isUserMsgSpeaking = speakingState.messageId === msg.id;

              return (
                <div key={msg.id} className="flex justify-end items-end gap-3 sm:gap-4">
                  <div className="max-w-[85%] sm:max-w-[74%] bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl rounded-br-sm p-4 shadow-md border-2 border-amber-300 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-amber-100 font-extrabold flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5" /> {childName} 说 (You asked):
                      </span>
                      {hasChineseChars && (
                        <button
                          onClick={() =>
                            speakChineseWithHighlight(msg.text, msg.id, false)
                          }
                          className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" /> 读一读
                        </button>
                      )}
                    </div>

                    {/* Display child's snapped/uploaded photo if attached */}
                    {msg.photo && (
                      <div className="rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-900/20 max-w-xs">
                        <img
                          src={msg.photo}
                          alt="Snapped by child"
                          className="w-full max-h-52 object-cover"
                        />
                        <div className="bg-black/40 px-2.5 py-1 text-[11px] font-bold text-amber-100 flex items-center gap-1">
                          <Camera className="w-3 h-3" /> 我拍的照片 • My Photo
                        </div>
                      </div>
                    )}

                    {hasChineseChars ? (
                      <div className="bg-white/95 rounded-2xl p-2.5 text-slate-900">
                        <CharacterRubyBlock
                          alignedItems={userAligned}
                          showPinyin={showPinyin}
                          activeCharIndex={
                            isUserMsgSpeaking ? speakingState.charIndex : null
                          }
                          isMessageSpeaking={isUserMsgSpeaking}
                          onClickChar={(ch, idx) =>
                            speakSingleCharacter(ch, idx, msg.id)
                          }
                          size="small"
                        />
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-extrabold leading-snug">
                        {msg.text}
                      </p>
                    )}
                  </div>

                  {/* Bigger Child Talking Head in Chat */}
                  <div className="shrink-0">
                    <TalkingHeadAvatar
                      role="child"
                      name={childName}
                      photoUrl={childPhoto}
                      defaultEmoji="🧒"
                      isSpeaking={isUserMsgSpeaking}
                      size="chat"
                      onUploadPhoto={(url) => setChildPhoto(url)}
                    />
                  </div>
                </div>
              );
            }

            // Tutor Message with Character-Aligned Pinyin, Bigger Talking Head & Photo Vocab Cards
            const alignedItems = alignChineseWithPinyin(msg.chinese, msg.pinyin);
            const isThisMsgSpeaking = speakingState.messageId === msg.id;
            const isPlayingNormal =
              isThisMsgSpeaking && speakingState.mode === 'normal';
            const isPlayingSlow =
              isThisMsgSpeaking && speakingState.mode === 'slow';

            return (
              <div key={msg.id} className="flex items-start gap-3 sm:gap-4">
                {/* Bigger Panda/Custom Tutor Talking Head in Chat */}
                <div className="shrink-0">
                  <TalkingHeadAvatar
                    role="tutor"
                    name={tutorName}
                    photoUrl={tutorPhoto}
                    defaultEmoji="🐼"
                    isSpeaking={isThisMsgSpeaking}
                    size="chat"
                    onUploadPhoto={(url) => setTutorPhoto(url)}
                  />
                </div>

                {/* Tutor Card */}
                <div className="flex-1 max-w-[90%] sm:max-w-[82%] bg-gradient-to-b from-slate-50 to-amber-50/40 border-2 border-amber-200 rounded-3xl rounded-tl-sm p-3.5 sm:p-5 shadow-md space-y-3.5">
                  {/* Top Bar: Audio Read-Along Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-300">
                        👆 点字发音 • 跟着大头像读
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          speakChineseWithHighlight(msg.chinese, msg.id, false)
                        }
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                          isPlayingNormal
                            ? 'bg-rose-500 text-white ring-4 ring-rose-200 scale-105'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isPlayingNormal ? '正在读... 停止' : '听一听 Listen'}</span>
                      </button>

                      <button
                        onClick={() =>
                          speakChineseWithHighlight(msg.chinese, msg.id, true)
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                          isPlayingSlow
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-105'
                            : 'bg-white hover:bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                        }`}
                      >
                        <Turtle className="w-4 h-4" />
                        <span>{isPlayingSlow ? '慢读中... 停止' : '慢速读 Slow'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Character-by-Character Chinese with Hanyu Pinyin directly underneath */}
                  <div className="py-1">
                    <CharacterRubyBlock
                      alignedItems={alignedItems}
                      showPinyin={showPinyin}
                      activeCharIndex={
                        isThisMsgSpeaking ? speakingState.charIndex : null
                      }
                      isMessageSpeaking={isThisMsgSpeaking}
                      onClickChar={(ch, idx) =>
                        speakSingleCharacter(ch, idx, msg.id)
                      }
                      size="large"
                    />
                  </div>

                  {/* If this response came from a Photo Question, show Discovered Photo Words! */}
                  {msg.detectedWords && msg.detectedWords.length > 0 && (
                    <div className="bg-amber-100/70 border-2 border-amber-300 rounded-2xl p-3 space-y-2">
                      <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-rose-500" />
                        <span>📸 照片里的新词语 • Words Spotted in Your Picture:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {msg.detectedWords.map((dw, dwIdx) => {
                          const dwId = `${msg.id}-dw-${dwIdx}`;
                          const dwAligned = alignChineseWithPinyin(
                            dw.hanzi,
                            dw.pinyin
                          );
                          const isDwSpeaking = speakingState.messageId === dwId;

                          return (
                            <div
                              key={dwIdx}
                              className="bg-white rounded-2xl p-2.5 border border-amber-300 shadow-xs flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-2xl">{dw.emoji || '✨'}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    speakChineseWithHighlight(dw.hanzi, dwId, false)
                                  }
                                  className="px-2 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-black flex items-center gap-1"
                                >
                                  <Volume2 className="w-3 h-3" /> 读
                                </button>
                              </div>
                              <CharacterRubyBlock
                                alignedItems={dwAligned}
                                showPinyin={true}
                                activeCharIndex={
                                  isDwSpeaking ? speakingState.charIndex : null
                                }
                                isMessageSpeaking={isDwSpeaking}
                                onClickChar={(ch, cIdx) =>
                                  speakSingleCharacter(ch, cIdx, dwId)
                                }
                                size="small"
                              />
                              <div className="text-xs font-bold text-slate-600 border-t border-slate-100 pt-1">
                                🇬🇧 {dw.meaning}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Caption 3: English Translation */}
                  {showEnglish && (
                    <div className="bg-sky-50 border-2 border-sky-200/80 rounded-2xl px-3.5 py-2.5 flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">🇬🇧</span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">
                          英文意思 • English Meaning
                        </span>
                        <p className="text-sm sm:text-base font-bold text-sky-950 leading-snug">
                          {msg.english}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Encouragement & Learning Tip */}
                  {msg.encouragement && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-3.5 py-2.5 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-emerald-950 font-bold leading-snug">
                        {msg.encouragement}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <TalkingHeadAvatar
                role="tutor"
                name={tutorName}
                photoUrl={tutorPhoto}
                defaultEmoji="🐼"
                isSpeaking={true}
                size="chat"
              />
              <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl px-5 py-3.5 text-sm font-black text-amber-900 flex items-center gap-2.5 shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>
                  {tutorName}正在看和想... (Analyzing & preparing Chinese + Pinyin...)
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {}
        <div className="mt-3 space-y-2.5">
          {/* Quick Reply Cards with Character-Under-Pinyin & Audio Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                点卡片回答，或点击 📸 拍照问一问 (Tap a sentence to reply or snap a photo):
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {activeScenario.quickReplies.map((qr, idx) => {
                const qrId = `qr-${activeScenario.id}-${idx}`;
                const qrAligned = alignChineseWithPinyin(qr.chinese, qr.pinyin);
                const isQrSpeaking = speakingState.messageId === qrId;

                return (
                  <div
                    key={qrId}
                    className="bg-white/95 hover:bg-amber-50/70 border-2 border-amber-300 hover:border-amber-500 rounded-2xl p-2.5 shadow-sm transition-all flex flex-col justify-between gap-2"
                  >
                    <CharacterRubyBlock
                      alignedItems={qrAligned}
                      showPinyin={showPinyin}
                      activeCharIndex={
                        isQrSpeaking ? speakingState.charIndex : null
                      }
                      isMessageSpeaking={isQrSpeaking}
                      onClickChar={(ch, cIdx) =>
                        speakSingleCharacter(ch, cIdx, qrId)
                      }
                      size="small"
                    />

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-100">
                      {showEnglish ? (
                        <span className="text-[11px] font-bold text-slate-500 truncate">
                          {qr.english}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            speakChineseWithHighlight(qr.chinese, qrId, false)
                          }
                          className={`px-2 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 ${
                            isQrSpeaking
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                          title="Listen to this sentence"
                        >
                          <Volume2 className="w-3 h-3" /> 听
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSendMessage(qr.chinese)}
                          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black shadow-xs disabled:opacity-50"
                        >
                          发送 ➤
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attached Photo Preview Banner if user snapped/selected a picture */}
          {attachedPhoto && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={attachedPhoto}
                  alt="Preview to ask AI"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow"
                />
                <div>
                  <span className="text-xs font-black text-rose-900 block">
                    📸 照片已准备好！Photo Ready to Ask AI
                  </span>
                  <span className="text-xs text-rose-700 font-semibold">
                    Type a question below or click &ldquo;发送 Send&rdquo; to ask what is in this picture!
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      inputText.trim() || '这是什么？请教我怎么用华语说！',
                      attachedPhoto
                    )
                  }
                  disabled={isLoading}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs shadow-sm hover:opacity-95"
                >
                  🔍 立即问乐乐 Ask Now ➤
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedPhoto(null)}
                  className="p-2 rounded-xl bg-rose-200 hover:bg-rose-300 text-rose-900 font-black text-xs"
                  title="Remove attached photo"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Input Box + Camera Button + Voice Microphone */}
          <div className="bg-white border-4 border-amber-300 rounded-3xl p-2 shadow-md flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Camera / Snap & Ask Button + Voice Mic */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openPhotoAskModal}
                className="px-3 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-sm transition-all cursor-pointer"
                title="Take a photo or upload an image to ask what is in the picture"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">拍照问一问</span>
              </button>

              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-200'
                    : 'bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300'
                }`}
                title="Click to speak in Chinese or English"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="hidden md:inline">停止 Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="hidden md:inline">说话 Speak</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSpeechLang(speechLang === 'zh-CN' ? 'en-SG' : 'zh-CN')
                }
                className="px-2 py-2.5 rounded-xl text-[11px] font-black bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                title="Switch Microphone Language"
              >
                {speechLang === 'zh-CN' ? '🇨🇳 华语' : '🇬🇧 ENG'}
              </button>
            </div>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                attachedPhoto
                  ? '问问照片里有什么 (Ask anything about your photo)...'
                  : '用华语、拼音或英文回答，或点击📸拍照问一问...'
              }
              className="flex-1 min-w-[180px] bg-transparent px-2 py-2 text-sm sm:text-base font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && !attachedPhoto) || isLoading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black text-sm flex items-center gap-1.5 shadow-md transition-all"
            >
              <span>发送</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Modal: Snap & Ask What's in the Picture (拍照问一问) */}
      {activeModal === 'camera' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border-4 border-rose-300 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-sm">
                  📸
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    拍照问一问 • Snap & Ask What&apos;s in the Picture!
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Take a photo, upload a picture, or tap a Singapore card to learn the Chinese words inside!
                  </p>
                </div>
              </div>
              <button
                onClick={closePhotoAskModal}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-700"
              >
                关闭 Close ✕
              </button>
            </div>

            {/* Live Camera Viewfinder OR Captured Photo Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-4 border-amber-300 shadow-inner min-h-[240px] flex flex-col items-center justify-center">
              {attachedPhoto ? (
                <div className="relative w-full flex flex-col items-center p-3 bg-slate-900">
                  <img
                    src={attachedPhoto}
                    alt="Captured preview"
                    className="max-h-64 rounded-2xl object-contain border-2 border-white shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedPhoto(null);
                      startCameraStream(cameraFacingMode);
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 font-black text-xs flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 重新拍照 Retake Photo
                  </button>
                </div>
              ) : isCameraActive ? (
                <div className="relative w-full flex flex-col items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-64 object-cover"
                  />
                  <div className="p-3 w-full bg-slate-900/90 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <SwitchCamera className="w-4 h-4" /> 切换镜头 Flip
                    </button>
                    <button
                      type="button"
                      onClick={capturePhotoFromVideo}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm shadow-lg ring-4 ring-rose-300/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> 咔嚓！拍照 Snap Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3 text-white">
                  <div className="text-4xl">📷</div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md font-semibold">
                    {cameraError ||
                      'Click below to start your camera or upload any picture from your device!'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => startCameraStream(cameraFacingMode)}
                      className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> 开启相机 Start Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => photoUploadInputRef.current?.click()}
                      className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4 text-rose-500" /> 上传照片 Upload Photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={photoUploadInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoFileSelect}
                className="hidden"
              />
            </div>

            {/* Upload or Try a Sample Singapore Photo Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700">
                  ✨ 或者点选新加坡示例照片试试看 • Or tap a sample picture to test right away:
                </span>
                <button
                  type="button"
                  onClick={() => photoUploadInputRef.current?.click()}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> 从电脑/手机选图
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PHOTO_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handlePickSamplePhotoCard(card)}
                    className="p-2.5 rounded-2xl border-2 border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/50 transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-2xl">{card.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {card.title}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 truncate">
                        {card.english}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question to ask about the picture */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3.5 space-y-2.5">
              <label className="text-xs font-black text-amber-950 block">
                💬 你想问乐乐关于这张照片的什么问题？ (What do you want to ask about this picture?)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '这是什么？请教我怎么用华语说！',
                  '照片里有什么颜色和东西？',
                  '可以用这张照片造一个华语短句吗？'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCameraQuestion(q)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all ${
                      cameraQuestion === q
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={cameraQuestion}
                  onChange={(e) => setCameraQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs sm:text-sm font-bold text-slate-800"
                  placeholder="输入你的问题 (Ask anything about the picture)..."
                />
                <button
                  type="button"
                  disabled={!attachedPhoto || isLoading}
                  onClick={() =>
                    handleSendMessage(cameraQuestion, attachedPhoto)
                  }
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-40 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>发送照片提问 Ask AI</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Customize Bigger Talking Head Avatars */}
      {activeModal === 'avatars' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-purple-300 space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                  🎭
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    自定义说话大头像 • Customize Talking Heads
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Upload your own photo for the Tutor or Child Talking Head!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-700"
              >
                关闭 Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tutor Talking Head Customizer */}
              <div className="p-4 rounded-3xl bg-amber-50/90 border-2 border-amber-300 flex flex-col items-center text-center space-y-3">
                <TalkingHeadAvatar
                  role="tutor"
                  name={tutorName}
                  subtitle="点击上传老师头像"
                  photoUrl={tutorPhoto}
                  defaultEmoji="🐼"
                  isSpeaking={false}
                  size="hero"
                  onUploadPhoto={(url) => setTutorPhoto(url)}
                  onResetPhoto={() => setTutorPhoto(null)}
                />
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-black text-amber-900 block">
                    伴读老师名字 (Tutor Name):
                  </label>
                  <input
                    type="text"
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-black text-center"
                  />
                </div>
              </div>

              {/* Child Talking Head Customizer */}
              <div className="p-4 rounded-3xl bg-sky-50/90 border-2 border-sky-300 flex flex-col items-center text-center space-y-3">
                <TalkingHeadAvatar
                  role="child"
                  name={childName}
                  subtitle="点击上传我的照片"
                  photoUrl={childPhoto}
                  defaultEmoji="🧒"
                  isSpeaking={false}
                  size="hero"
                  onUploadPhoto={(url) => setChildPhoto(url)}
                  onResetPhoto={() => setChildPhoto(null)}
                />
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-black text-sky-900 block">
                    我的名字 (My Name):
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-sky-300 bg-white text-xs font-black text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm"
              >
                完成 Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Vocabulary Word Bank with Character-Under-Pinyin alignment */}
      {activeModal === 'vocab' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-emerald-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                  📖
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    我的词语本 • Word Bank ({activeScenario.title})
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Tap Listen to watch each character and Pinyin light up!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-700"
              >
                关闭 Close ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {activeScenario.vocab.map((item, idx) => {
                const vocabId = `vocab-${idx}`;
                const alignedVocab = alignChineseWithPinyin(item.hanzi, item.pinyin);
                const isVocabSpeaking = speakingState.messageId === vocabId;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-white p-2.5 rounded-2xl shadow-sm border border-emerald-100">
                        {item.emoji}
                      </span>
                      <div>
                        <CharacterRubyBlock
                          alignedItems={alignedVocab}
                          showPinyin={true}
                          activeCharIndex={
                            isVocabSpeaking ? speakingState.charIndex : null
                          }
                          isMessageSpeaking={isVocabSpeaking}
                          onClickChar={(ch, cIdx) =>
                            speakSingleCharacter(ch, cIdx, vocabId)
                          }
                          size="small"
                        />
                        <div className="text-xs font-extrabold text-emerald-900 mt-1.5">
                          🇬🇧 {item.meaning}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        speakChineseWithHighlight(item.hanzi, vocabId, false)
                      }
                      className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                        isVocabSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>读一读</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Kid-Friendly Star Sticker Rewards Book */}
      {activeModal === 'stickers' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    我的星星贴纸簿 • Star Sticker Book
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Every Chinese reply earns 1 ⭐ star! Collect them all!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-700"
              >
                关闭 Close ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-extrabold uppercase opacity-90">
                  我的星星 Total Stars
                </div>
                <div className="text-2xl font-black">{stars} 颗星 ⭐</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold uppercase opacity-90">
                  已解锁贴纸 Unlocked
                </div>
                <div className="text-xl font-black">
                  {unlockedStickersCount} / {STICKER_REWARDS.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STICKER_REWARDS.map((st) => {
                const unlocked = stars >= st.starsRequired;
                return (
                  <div
                    key={st.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      unlocked
                        ? 'bg-amber-50 border-amber-300 shadow-sm'
                        : 'bg-slate-100/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm">
                      {unlocked ? st.emoji : '🔒'}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">
                        {st.name}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {st.english}
                      </div>
                      <div className="text-[11px] font-extrabold text-amber-700 mt-0.5">
                        {unlocked
                          ? '✓ 已获得 Unlocked!'
                          : `需要 ${st.starsRequired} 颗星 (${st.starsRequired} stars)`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Live JSON Output Inspector */}
      {activeModal === 'json' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900">
                  Latest Structured JSON Response
                </h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Each Chinese character is paired 1-to-1 with its Hanyu Pinyin syllable from this JSON payload and highlighted during speech playback:
            </p>

            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {lastRawJson}
            </pre>
          </div>
        </div>
      )}

      {/* Modal 4: AI Connector & System Prompt Settings */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-6 h-6 text-amber-500" />
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Open-Source AI Connector & System Prompt
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test in-browser with the built-in AI or connect to your local Ollama / Open-Source LLM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close ✕
              </button>
            </div>

            {/* AI Backend Selector */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                1. Select AI Backend Engine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setEngineMode('builtin')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    engineMode === 'builtin'
                      ? 'border-amber-500 bg-amber-50/70'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>⚡ Built-in Cloud AI (Instant Preview)</span>
                    {engineMode === 'builtin' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Works immediately in this preview with strict JSON schema output.
                  </p>
                </button>

                <button
                  onClick={() => setEngineMode('ollama')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    engineMode === 'ollama'
                      ? 'border-indigo-600 bg-indigo-50/70'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>🦙 Local Open-Source LLM (Ollama)</span>
                    {engineMode === 'ollama' && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Connects to free local models like <code>qwen2.5:7b</code> or <code>llama3.1</code>.
                  </p>
                </button>
              </div>
            </div>

            {engineMode === 'ollama' && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-indigo-950 block mb-1">
                      Ollama Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-950 block mb-1">
                      Open-Source Model Name
                    </label>
                    <input
                      type="text"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="qwen2.5:7b"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  <strong>Tip:</strong> Run <code>OLLAMA_ORIGINS="*" ollama serve</code> and{' '}
                  <code>ollama run qwen2.5:7b</code> on your computer so the browser can connect directly to your local model.
                </p>
              </div>
            )}

            {/* Editable System Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  2. Active System Prompt (Character-Aligned Pinyin JSON)
                </label>
                <button
                  onClick={() => copyToClipboard(systemPrompt)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={10}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Reset Default Prompt
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}