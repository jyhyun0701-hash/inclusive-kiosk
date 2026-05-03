import React from 'react';
import type { Language } from '../../types/kiosk';
import imgHome        from '../../assets/images/home.png';
import imgInfo     from '../../assets/images/info.png';
import imgSoundOn  from '../../assets/images/sound-on.png';
import imgSoundOff from '../../assets/images/sound-off.png';
import imgZoomIn   from '../../assets/images/zoom-in.png';
import imgZoomOut  from '../../assets/images/zoom-out.png';

interface BottomBarProps {
  language: Language;
  isTtsOn: boolean;
  isMagnified: boolean;
  onHome: () => void;
  onInfo: () => void;
  onToggleTts: () => void;
  onToggleMagnify: () => void;
}

const LABELS: Record<Language, { home: string; info: string; ttsOn: string; ttsOff: string; magnify: string }> = {
  ko: { home: '처음으로', info: '이용 안내', ttsOn: '음성 켜기', ttsOff: '음성 끄기', magnify: '화면확대' },
  en: { home: 'Home', info: 'Guide', ttsOn: 'TTS ON', ttsOff: 'TTS OFF', magnify: 'Zoom' },
  ja: { home: '最初へ', info: '案内', ttsOn: '音声', ttsOff: '音声', magnify: '画面拡大' },
  zh: { home: '首页', info: '使用指南', ttsOn: '语音开', ttsOff: '语音关', magnify: '放大' },
};

const BottomBar: React.FC<BottomBarProps> = ({
  language, isTtsOn, isMagnified,
  onHome, onInfo, onToggleTts, onToggleMagnify,
}) => {
  const l = LABELS[language];

  return (
    <div className="kiosk-bottom">
      {/* 처음으로 */}
      <button
        className="bottom-btn home"
        onClick={onHome}
        data-tabfocus="Y"
        data-tabgroup="bottombar"
        data-ttsmsg={l.home}
        tabIndex={0}
        aria-label={l.home}
      >
        <img src={imgHome} alt="" />
        <span> {l.home} </span>
      </button>

      {/* 이용 안내 */}
      <button
        className="bottom-btn info"
        onClick={onInfo}
        data-tabfocus="Y"
        data-tabgroup="bottombar"
        data-ttsmsg={l.info}
        tabIndex={1}
        aria-label={l.info}
      >
       <img src={imgInfo} alt="" />
       <span> {l.info} </span>
      </button>

      {/* 음성 켜기 */}
      <button
        className={`bottom-btn tts${isTtsOn ? ' active' : ''}`}
        onClick={onToggleTts}
        data-tabfocus="Y"
        data-tabgroup="bottombar"
        data-ttsmsg={isTtsOn ? l.ttsOff : l.ttsOn}
        tabIndex={2}
        aria-label={isTtsOn ? l.ttsOff : l.ttsOn}
        aria-pressed={isTtsOn}
      >
        <img src={isTtsOn ? imgSoundOff : imgSoundOn} alt=""/>
        <span> {isTtsOn ? l.ttsOff : l.ttsOn} </span>
      </button>

      {/* 화면 확대 */}
      <button
        className={`bottom-btn magnify ${isMagnified ? ' active' : ''}`}
        onClick={onToggleMagnify}
        data-tabfocus="Y"
        data-tabgroup="bottombar"
        data-ttsmsg={l.magnify}
        tabIndex={3}
        aria-label={l.magnify}
        aria-pressed={isMagnified}
      >
        <img src={isMagnified ? imgZoomOut : imgZoomIn} alt="" />
        <span> {l.magnify} </span>
      </button>
    </div>
  );
};

export default BottomBar;
