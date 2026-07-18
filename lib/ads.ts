export interface BannerAd {
  id: string;
  href: string;
  imgSrc: string;
  pixelSrc: string;
  width?: number;
  height?: number;
}

// Raw affiliate creatives as supplied — hrefs, image sources, and tracking
// pixel URLs are kept byte-for-byte so attribution isn't broken. Shared by
// the rising bottom banner and the in-article sponsored picks so there's
// one source of truth for these codes.
export const AD_BANNERS: BannerAd[] = [
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

/** sessionStorage key used to cap the rising banner to once per browser session. */
export const AD_SESSION_KEY = 'loophole_rising_ad_shown';
