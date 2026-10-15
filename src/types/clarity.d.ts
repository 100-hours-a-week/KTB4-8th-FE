/* @microsoft/clarity 는 타입 선언을 배포하지 않는다 — 실제로 쓰는 메서드만 최소로 선언한다. */
declare module "@microsoft/clarity" {
  interface Clarity {
    init(projectId: string): void;
    setTag(key: string, value: string | string[]): void;
    identify(
      customerId: string,
      customSessionId?: string,
      customPageId?: string,
      friendlyName?: string,
    ): void;
    consent(consent?: boolean): void;
    event(eventName: string): void;
    upgrade(reason: string): void;
  }

  const clarity: Clarity;
  export default clarity;
}
