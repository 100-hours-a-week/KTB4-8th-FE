import { Icon } from "@/components/ui/Icon";
import { filterLabel, type EventFilter } from "./eventFilter";

/** "카테고리 · 지역" 필터 시트를 여는 버튼 — 고르면 "팝업 · 성동구"처럼 고른 값이 보인다(보관함 · 요즘 뜨는 곳 전체보기가 같이 쓴다) */
export function FilterButton({
  filter,
  placeholder = "카테고리 · 지역",
  onOpen,
}: {
  filter: EventFilter;
  placeholder?: string;
  onOpen: () => void;
}) {
  const label = filterLabel(filter);
  return (
    <button
      className={`evf__btn${label ? " is-on" : ""}`}
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <Icon name="sliders" size={15} />
      <span>{label || placeholder}</span>
      <Icon name="chevronDown" size={14} />
    </button>
  );
}
