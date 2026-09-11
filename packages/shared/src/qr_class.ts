import QRCode from 'qrcode';

// Standalone QR generator. Not wired into any feature — invoked on demand.
// Works in both Node (backend) and the browser (web), except toBuffer()
// which needs Node's Buffer.

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrClassOptions {
  size?: number; // output width/height in px, default 256
  margin?: number; // quiet-zone width in modules, default 2
  errorCorrectionLevel?: QrErrorCorrectionLevel; // default 'M'
  darkColor?: string; // module color, default '#000000'
  lightColor?: string; // background color, default '#FFFFFF'
}

const DEFAULTS: Required<QrClassOptions> = {
  size: 256,
  margin: 2,
  errorCorrectionLevel: 'M',
  darkColor: '#000000',
  lightColor: '#FFFFFF',
};

export class QrClass {
  private readonly defaults: Required<QrClassOptions>;

  constructor(options: QrClassOptions = {}) {
    this.defaults = { ...DEFAULTS, ...options };
  }

  private resolve(overrides?: QrClassOptions): Required<QrClassOptions> {
    return { ...this.defaults, ...overrides };
  }

  /** PNG data URL (e.g. for an <img src>) */
  async toDataUrl(text: string, overrides?: QrClassOptions): Promise<string> {
    const o = this.resolve(overrides);
    return QRCode.toDataURL(text, {
      width: o.size,
      margin: o.margin,
      errorCorrectionLevel: o.errorCorrectionLevel,
      color: { dark: o.darkColor, light: o.lightColor },
    });
  }

  /** Inline SVG markup string */
  async toSvg(text: string, overrides?: QrClassOptions): Promise<string> {
    const o = this.resolve(overrides);
    return QRCode.toString(text, {
      type: 'svg',
      width: o.size,
      margin: o.margin,
      errorCorrectionLevel: o.errorCorrectionLevel,
      color: { dark: o.darkColor, light: o.lightColor },
    });
  }

  /** Raw PNG buffer — Node only (e.g. attaching to an email or a generated PDF) */
  async toBuffer(text: string, overrides?: QrClassOptions): Promise<Buffer> {
    const o = this.resolve(overrides);
    return QRCode.toBuffer(text, {
      width: o.size,
      margin: o.margin,
      errorCorrectionLevel: o.errorCorrectionLevel,
      color: { dark: o.darkColor, light: o.lightColor },
    });
  }
}
