export const siteConfig = {
  name: 'PakGet',
  url: 'https://pakget.app',
  description:
    'Download public videos from YouTube, Instagram, TikTok, Facebook, and X in Pakistan. Fast, free, and no account required.',
  locale: 'en_PK',
  keywords: [
    'video downloader Pakistan',
    'online video downloader Pakistan',
    'YouTube downloader Pakistan',
    'Instagram Reels downloader Pakistan',
    'TikTok downloader Pakistan',
    'Facebook video downloader Pakistan',
    'Twitter video downloader Pakistan',
    'X video downloader Pakistan',
    'download public social media videos',
    'MP4 video downloader',
  ],
} as const;

export const faqs = [
  {
    question: 'Is PakGet free to use in Pakistan?',
    answer:
      'Yes. PakGet is free to use and does not require an account. It is available in Pakistan for downloading supported public videos.',
  },
  {
    question: 'Which platforms does PakGet support?',
    answer:
      'PakGet supports public videos from YouTube, Instagram, TikTok, Facebook, and X (formerly Twitter). Available formats and quality options depend on the original post and platform.',
  },
  {
    question: 'Is it safe to download videos using PakGet?',
    answer:
      'PakGet is a stateless utility and does not keep a download history or require an account. Only download public media that you own or have permission to save.',
  },
  {
    question: 'Why is a video failing to download?',
    answer:
      'A video may be private, restricted, unavailable in your region, removed by its creator, or protected by platform controls. PakGet only works with supported public videos.',
  },
  {
    question: 'Can PakGet download TikTok videos without a watermark?',
    answer:
      'For supported public TikTok videos, PakGet attempts to retrieve the original source stream when it is available. Results can vary by video and platform availability.',
  },
] as const;
