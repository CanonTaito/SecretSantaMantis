import { describe, expect, test } from 'vitest'
import { inAppBrowser } from './inAppBrowser.ts'

const UA = {
  facebookIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/FBIOS;FBAV/490.0.0.38.105;FBBV/659000000;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBID/phone;FBLC/en_GB;FBOP/5]',
  facebookAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.48.80;]',
  messengerIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/MessengerForiOS;FBAV/480.0.0.40.109;FBBV/650000000;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS]',
  messengerAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/480.0.0.40.109;]',
  instagram:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 Instagram 355.0.0.20.95 (iPhone15,2; iOS 18_1; en_AU; en; scale=3.00; 1179x2556; 650000000)',
  safari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  chromeDesktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
}

describe('inAppBrowser', () => {
  test('spots the Facebook app on iPhone and Android', () => {
    expect(inAppBrowser(UA.facebookIos, '')).toBe('Facebook')
    expect(inAppBrowser(UA.facebookAndroid, '')).toBe('Facebook')
  })

  test('tells Messenger apart from Facebook', () => {
    expect(inAppBrowser(UA.messengerIos, '')).toBe('Messenger')
    expect(inAppBrowser(UA.messengerAndroid, '')).toBe('Messenger')
  })

  test('spots Instagram', () => {
    expect(inAppBrowser(UA.instagram, '')).toBe('Instagram')
  })

  test('leaves normal browsers alone', () => {
    expect(inAppBrowser(UA.safari, '')).toBeNull()
    expect(inAppBrowser(UA.chromeDesktop, '')).toBeNull()
  })

  test('?inapp= forces it for previews, and ignores unknown values', () => {
    expect(inAppBrowser(UA.chromeDesktop, '?inapp=facebook')).toBe('Facebook')
    expect(inAppBrowser(UA.chromeDesktop, '?inapp=Instagram')).toBe('Instagram')
    expect(inAppBrowser(UA.chromeDesktop, '?inapp=tiktok')).toBeNull()
  })
})
