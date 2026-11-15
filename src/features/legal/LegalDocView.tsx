import { LEGAL_REVISED, LEGAL_VERSION, type LegalDoc } from "./content";

/* 앱 안 이용약관 · 개인정보 처리방침 본문. 스타일은 pages.css 의 .legal__* */
export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <div className="me__body">
      <article className="legal__doc">
        <p className="legal__rev">
          최종 개정일 {LEGAL_REVISED} · 버전 {LEGAL_VERSION}
        </p>

        {doc.notice && (
          <div className="legal__notice">
            <p className="legal__notice-title">{doc.notice.title}</p>
            <p>{doc.notice.text}</p>
          </div>
        )}
        {doc.intro && <p className="legal__p">{doc.intro}</p>}

        {doc.sections.map((section) => (
          <section className="legal__sec" key={section.title}>
            <h2 className="legal__h">{section.title}</h2>
            {section.blocks.map((block, i) => {
              if (block.kind === "ul")
                return (
                  <ul className="legal__ul" key={i}>
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              if (block.kind === "sub")
                return (
                  <p className="legal__sub" key={i}>
                    {block.text}
                  </p>
                );
              return (
                <p className="legal__p" key={i}>
                  {block.text}
                </p>
              );
            })}
          </section>
        ))}
      </article>
    </div>
  );
}
