/**
 * numInputRegistry
 *
 * 가상/물리 키패드의 숫자 입력을 현재 활성 페이지의 핸들러로 전달
 *
 * 사용법:
 * 1. 주민번호 입력 페이지에서 핸들러 등록
 *    numInputRegistry.register((num) => handleNum(num));
 *
 * 2. 페이지 언마운트 시 해제
 *    numInputRegistry.unregister();
 *
 * 3. 가상 키패드에서 숫자 입력 시 호출
 *    numInputRegistry.input('1');
 */
const registry: { handler: ((num: string) => void) | null } = { handler: null };

export const numInputRegistry = {
  register: (fn: (num: string) => void) => { registry.handler = fn; },
  unregister: () => { registry.handler = null; },
  input: (num: string) => { registry.handler?.(num); },
  hasHandler: () => registry.handler !== null,
};
