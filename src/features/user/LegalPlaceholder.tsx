import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";

/* 이용약관 · 개인정보 처리방침 — 본문은 팀에서 확정해 오면 채우고, 그때까지는 준비 중 화면을 보여 준다. */
export function LegalPlaceholder({ title }: { title: string }) {
  return (
    <>
      <AppBar back title={title} />
      <div className="me__body">
        <div className="legal__empty">
          <span className="legal__empty-ico">
            <Icon name="file" size={28} />
          </span>
          <p className="legal__empty-title">{title}을 준비하고 있어요</p>
          <p className="legal__empty-sub">
            정식 서비스를 시작하기 전에
            <br />
            이곳에서 확인하실 수 있게 올려둘게요.
          </p>
        </div>
      </div>
    </>
  );
}
