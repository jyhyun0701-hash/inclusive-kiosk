/**
 * HangulComposer
 * 개별 자모를 받아 올바른 한글 음절로 조합합니다.
 *
 * 예시: ㄱ → ㅏ → ㅈ → ㅗ → ㄱ → "가족"
 */

// 초성 (19개)
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
// 중성 (21개)
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
// 종성 (28개, 0번 = 없음)
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 초성 인덱스 맵
const CHO_IDX: Record<string, number> = Object.fromEntries(CHO.map((c, i) => [c, i]));
// 중성 인덱스 맵
const JUNG_IDX: Record<string, number> = Object.fromEntries(JUNG.map((v, i) => [v, i]));
// 자음 → 종성 인덱스 (받침이 될 수 있는 자음만)
const CONSONANT_TO_JONG: Record<string, number> = {
  'ㄱ':1,'ㄲ':2,'ㄴ':4,'ㄷ':7,'ㄹ':8,'ㅁ':16,'ㅂ':17,'ㅅ':19,'ㅆ':20,'ㅇ':21,'ㅈ':22,'ㅊ':23,'ㅋ':24,'ㅌ':25,'ㅍ':26,'ㅎ':27
};
// 종성 인덱스 → 초성 인덱스 (모음이 뒤에 올 때 분리)
const JONG_TO_CHO: Record<number, number> = {
  1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,21:11,22:12,23:14,24:15,25:16,26:17,27:18
};
// 겹받침 조합: "종성idx,자음" → 겹받침idx
const COMPOUND_FORM: Record<string, number> = {
  '1,ㅅ':3,'4,ㅈ':5,'4,ㅎ':6,
  '8,ㄱ':9,'8,ㅁ':10,'8,ㅂ':11,'8,ㅅ':12,'8,ㅌ':13,'8,ㅍ':14,'8,ㅎ':15,
  '17,ㅅ':18
};
// 겹받침 분리: 겹받침idx → [남을종성idx, 다음초성idx]
const COMPOUND_SPLIT: Record<number, [number, number]> = {
  3:[1,9],5:[4,12],6:[4,18],
  9:[8,0],10:[8,6],11:[8,7],12:[8,9],13:[8,16],14:[8,17],15:[8,18],
  18:[17,9]
};

function syllable(cho: number, jung: number, jong: number): string {
  return String.fromCharCode(0xAC00 + cho * 21 * 28 + jung * 28 + jong);
}

// 조합 상태 타입
export type HangulState =
  | { type: 'empty';        text: string }
  | { type: 'cho';          text: string; cho: number }
  | { type: 'cho_jung';     text: string; cho: number; jung: number }
  | { type: 'cho_jung_jong';text: string; cho: number; jung: number; jong: number };

export const HANGUL_INITIAL: HangulState = { type: 'empty', text: '' };

/** 현재 상태 → 표시 문자열 */
export function stateToString(s: HangulState): string {
  switch (s.type) {
    case 'empty':        return s.text;
    case 'cho':          return s.text + CHO[s.cho];
    case 'cho_jung':     return s.text + syllable(s.cho, s.jung, 0);
    case 'cho_jung_jong':return s.text + syllable(s.cho, s.jung, s.jong);
  }
}

/** 자모 하나 추가 */
export function addJamo(state: HangulState, jamo: string): HangulState {
  const isVowel     = jamo in JUNG_IDX;
  const isConsonant = jamo in CHO_IDX;

  if (!isVowel && !isConsonant) {
    return { type: 'empty', text: stateToString(state) + jamo };
  }

  if (isVowel) {
    const vi = JUNG_IDX[jamo];
    switch (state.type) {
      case 'empty':
        // 단독 모음: 묵음 ㅇ(11) 초성으로 음절 시작
        return { type: 'cho_jung', text: state.text, cho: 11, jung: vi };
      case 'cho':
        return { type: 'cho_jung', text: state.text, cho: state.cho, jung: vi };
      case 'cho_jung':
        // 현재 음절 완성, 새 모음 (묵음 ㅇ)
        return { type: 'cho_jung', text: state.text + syllable(state.cho, state.jung, 0), cho: 11, jung: vi };
      case 'cho_jung_jong': {
        const split = COMPOUND_SPLIT[state.jong];
        if (split) {
          // 겹받침 분리: 앞 받침 남기고 뒤 자음이 다음 초성으로
          const [remainJong, newCho] = split;
          return { type: 'cho_jung', text: state.text + syllable(state.cho, state.jung, remainJong), cho: newCho, jung: vi };
        }
        // 단받침 → 다음 초성으로
        const newCho = JONG_TO_CHO[state.jong];
        if (newCho !== undefined) {
          return { type: 'cho_jung', text: state.text + syllable(state.cho, state.jung, 0), cho: newCho, jung: vi };
        }
        return { type: 'cho_jung', text: stateToString(state), cho: 11, jung: vi };
      }
    }
  }

  // 자음
  const ci          = CHO_IDX[jamo];
  const possibleJong = CONSONANT_TO_JONG[jamo];

  switch (state.type) {
    case 'empty':
      return { type: 'cho', text: state.text, cho: ci };
    case 'cho':
      // 이전 초성 완성, 새 초성 시작
      return { type: 'cho', text: state.text + CHO[state.cho], cho: ci };
    case 'cho_jung':
      if (possibleJong !== undefined) {
        return { type: 'cho_jung_jong', text: state.text, cho: state.cho, jung: state.jung, jong: possibleJong };
      }
      // 받침이 불가능한 자음(ㄸ,ㅃ,ㅉ)은 새 초성
      return { type: 'cho', text: state.text + syllable(state.cho, state.jung, 0), cho: ci };
    case 'cho_jung_jong': {
      const compoundKey = `${state.jong},${jamo}`;
      const compound    = COMPOUND_FORM[compoundKey];
      if (compound !== undefined) {
        return { ...state, jong: compound };
      }
      // 겹받침 불가 → 현재 음절 완성, 새 초성
      return { type: 'cho', text: state.text + syllable(state.cho, state.jung, state.jong), cho: ci };
    }
  }
}

/** 백스페이스 처리 */
export function deleteJamo(state: HangulState): HangulState {
  switch (state.type) {
    case 'empty':
      if (!state.text.length) return state;
      return { type: 'empty', text: state.text.slice(0, -1) };
    case 'cho':
      return { type: 'empty', text: state.text };
    case 'cho_jung':
      return { type: 'cho', text: state.text, cho: state.cho };
    case 'cho_jung_jong': {
      const split = COMPOUND_SPLIT[state.jong];
      if (split) return { ...state, jong: split[0] };
      return { type: 'cho_jung', text: state.text, cho: state.cho, jung: state.jung };
    }
  }
}

/** 조합 완료 후 확정 문자열 반환 */
export function flushState(state: HangulState): string {
  return stateToString(state);
}
