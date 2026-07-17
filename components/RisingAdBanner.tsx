'use client';

import { useEffect, useState } from 'react';

interface BannerAd {
  id: string;
  href: string;
  imgSrc: string;
  pixelSrc: string;
  width?: number;
  height?: number;
}

// Raw affiliate creatives as supplied — hrefs, image sources, and tracking
// pixel URLs are kept byte-for-byte so attribution isn't broken.
const BANNERS: BannerAd[] = [
  {
    id: 'a8-rakuten',
    href:
      'https://rpx.a8.net/svt/ejp?a8mat=3NA6HT+AFOJHU+2HOM+65U41&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa22050476466_3NA6HT_AFOJHU_2HOM_65U41%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F',
    imgSrc: 'http://hbb.afl.rakuten.co.jp/hsb/0eb4bbb5.960cf723.0eb4bbaa.95151395/',
    pixelSrc: 'https://www19.a8.net/0.gif?a8mat=3NA6HT+AFOJHU+2HOM+65U41',
  },
  {
    id: 'a8-300x250',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B7VL8+AWY4T6+5ERO+5YZ75',
    imgSrc: 'https://www20.a8.net/svt/bgt?aid=260708012660&wid=002&eno=01&mid=s00000025242001003000&mc=1',
    pixelSrc: 'https://www15.a8.net/0.gif?a8mat=4B7VL8+AWY4T6+5ERO+5YZ75',
    width: 300,
    height: 250,
  },
  {
    id: 'a8-728x90',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B82L1+FRZMZ6+4AHY+61C2P',
    imgSrc: 'https://www23.a8.net/svt/bgt?aid=260717077954&wid=005&eno=01&mid=s00000020023001014000&mc=1',
    pixelSrc: 'https://www11.a8.net/0.gif?a8mat=4B82L1+FRZMZ6+4AHY+61C2P',
    width: 728,
    height: 90,
  },
];

/**
 * A bottom-anchored ad banner that slides up into view shortly after the
 * page mounts. One of BANNERS is picked at random per page load, client-side
 * only (avoids any server/client mismatch), and can be dismissed.
 */
export function RisingAdBanner() {
  const [banner, setBanner] = useState<BannerAd | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setBanner(BANNERS[Math.floor(Math.random() * BANNERS.length)]);
    const showTimer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  if (!banner || dismissed) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 pointer-events-none transition-transform duration-500 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-[150%]'
      }`}
    >
      <div className="relative pointer-events-auto bg-white dark:bg-panel-dark border-2 border-graphite dark:border-white/80 p-2 shadow-xl max-w-full">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close ad"
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-graphite dark:bg-white text-white dark:text-graphite text-sm leading-none flex items-center justify-center border-2 border-white dark:border-graphite"
        >
          ×
        </button>
        <a href={banner.href} rel="nofollow noopener noreferrer" target="_blank">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imgSrc}
            width={banner.width}
            height={banner.height}
            alt=""
            className="block max-w-full h-auto"
          />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.pixelSrc} width={1} height={1} alt="" className="absolute w-px h-px opacity-0" />
      </div>
    </div>
  );
}
