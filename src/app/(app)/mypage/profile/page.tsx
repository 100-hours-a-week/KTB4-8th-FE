"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import {
  Avatar,
  AVATAR_PRESETS,
  imageToBlob,
  initialsToBlob,
  PersonGlyph,
  presetToBlob,
  Spinner,
} from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { describe, isApiError, uploadProfileImage } from "@/lib/api/client";
import { MAX_NICKNAME, NICKNAME_DISALLOWED } from "@/lib/constants";
import { useAccounts, useMe } from "@/features/auth/session";
import { usePatchUser } from "@/features/user/queries";

/** 저장 버튼을 누를 때 실제로 업로드해야 하는 것. null 이면 사진은 안 바꾼다.
    BE 는 profileImageUrl 에 실제 업로드된 파일의 저장 경로만 받아서(가짜 id 불가),
    프리셋도 캔버스로 그려 POST /user/profile-image 에 올린 뒤 그 경로를 써야 한다. */
type PendingPhoto =
  | { kind: "preset"; bg: string; icon: string }
  | { kind: "upload"; blob: Blob; filename: string }
  | { kind: "clear" };

/* 10 · 프로필 수정 — PATCH /user. 프로토타입 js/pages/profile-edit.js 를 그대로 옮겼다.
   흔들림 애니메이션(is-shake)은 React 리렌더 타이밍과 무관하게 매번 재생돼야 해서
   프로토타입처럼 DOM 클래스를 직접 다룬다(state 로만 토글하면 같은 값이 연속될 때 재생되지 않는다). */

const MAX_NAME = MAX_NICKNAME;

export default function ProfileEditPage() {
  const router = useRouter();
  const meQuery = useMe();
  const accountsQuery = useAccounts();
  const patchUser = usePatchUser();

  const [initialized, setInitialized] = useState(false);
  const [nickname, setNickname] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimer = useRef<number | null>(null);

  // 서버 값이 오면 최초 1회만 편집 상태를 채운다 — 이후엔 화면이 들고 있는 값을 그대로 유지한다.
  // (렌더 중 상태 조정 패턴: https://react.dev/learn/you-might-not-need-an-effect)
  if (!initialized && meQuery.data) {
    setInitialized(true);
    setNickname(meQuery.data.nickname);
    setPhoto(meQuery.data.profileImageUrl);
  }

  function shake() {
    const el = inputRef.current;
    if (!el) return;
    el.classList.remove("is-shake");
    void el.offsetWidth; // 애니메이션 재시작을 위한 강제 리플로우
    el.classList.add("is-shake");
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(
      () => el.classList.remove("is-shake"),
      420,
    );
  }

  function handleNicknameChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const filtered = raw.replace(NICKNAME_DISALLOWED, ""); // 띄어쓰기 · 특수기호는 입력 즉시 걸러낸다
    let next = filtered;
    let overflowed = filtered.length !== raw.length;
    if (next.length > MAX_NAME) {
      next = next.slice(0, MAX_NAME);
      overflowed = true;
    }
    setNickname(next);
    if (overflowed) shake();
  }

  function handleNicknameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // 이미 10자인데 한 글자를 더 치려고 할 때도 흔들어서 한계를 알려준다
    const typing = e.key.length === 1 && !e.metaKey && !e.ctrlKey;
    const el = e.currentTarget;
    const hasSelection = el.selectionStart !== el.selectionEnd;
    if (typing && !hasSelection && el.value.length >= MAX_NAME) shake();
  }

  async function handleSave() {
    setSaving(true);
    setFieldError(null);
    try {
      // 프리셋 · 앨범 사진 · 이니셜(되돌리기) 모두 실제 파일로 먼저 올려서 저장 경로를 받아야
      // PATCH /user 가 유효한 profileImageUrl 로 받아들인다(가짜 id 는 500 이 난다).
      // BE 에 "사진 없음(null)"을 표현할 방법이 없어서, 되돌리기도 이니셜 이미지를 진짜로
      // 그려 올리는 식으로 처리한다 — Avatar 의 이니셜 폴백과 똑같이 보인다.
      let profileImageUrl: string | undefined;
      if (pending?.kind === "preset") {
        const blob = await presetToBlob(pending.bg, pending.icon);
        profileImageUrl = await uploadProfileImage(blob, "preset.png");
      } else if (pending?.kind === "upload") {
        profileImageUrl = await uploadProfileImage(
          pending.blob,
          pending.filename,
        );
      } else if (pending?.kind === "clear") {
        const blob = await initialsToBlob(nickname);
        profileImageUrl = await uploadProfileImage(blob, "default.png");
      }
      await patchUser.mutateAsync({
        nickname,
        ...(profileImageUrl !== undefined ? { profileImageUrl } : {}),
      });
      toast.ok("프로필을 저장했어요.");
      router.replace("/mypage");
    } catch (err) {
      setSaving(false);
      const d = describe(err);
      if (
        isApiError(err) &&
        err.code === "USER_VALIDATION_FAILED" &&
        d.field === "name"
      ) {
        setFieldError(d.text); // errors[0].message 를 필드 오류로 표시한다
        return;
      }
      toast.fromError(err);
    }
  }

  function applyPhoto(
    nextPhoto: string | null,
    nextPending: PendingPhoto | null,
  ) {
    setPhoto(nextPhoto);
    setPending(nextPending);
    setPhotoSheetOpen(false);
  }

  const full = nickname.length >= MAX_NAME;

  return (
    <>
      <AppBar back title="프로필 수정" />
      <div className="scroll scroll--pad">
        <div className="profile__photo">
          <div className="profile__photo-wrap">
            <Avatar
              nickname={nickname || meQuery.data?.nickname}
              profileImageUrl={photo}
              size="xl"
            />
            <button
              className="profile__photo-btn"
              type="button"
              aria-label="프로필 사진 변경"
              onClick={() => setPhotoSheetOpen(true)}
            >
              <Icon name="camera" size={17} />
            </button>
          </div>
          <button
            className="btn btn--mute btn--sm btn--pill"
            type="button"
            onClick={() => setPhotoSheetOpen(true)}
          >
            사진 변경
          </button>
        </div>

        <div className={`field${fieldError ? " field--error" : ""}`}>
          <label className="field__label" htmlFor="nickname">
            이름
          </label>
          <input
            ref={inputRef}
            className="field__input"
            id="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            onKeyDown={handleNicknameKeyDown}
          />
          <div className="field__foot">
            <span className="field__help">
              {fieldError ||
                `최소 1글자, 최대 ${MAX_NAME}글자 · 띄어쓰기와 특수기호는 쓸 수 없어요.`}
            </span>
            <span className="field__count" data-full={full ? "true" : "false"}>
              {nickname.length}/{MAX_NAME}
            </span>
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="email">
            Google 계정 이메일
          </label>
          <input
            className="field__input"
            id="email"
            value={meQuery.data?.email ?? accountsQuery.data?.[0]?.email ?? ""}
            disabled
            readOnly
          />
          <span className="field__help">
            이메일은 Google 계정에서 변경할 수 있어요.
          </span>
        </div>
      </div>

      <div className="me__foot">
        <button
          className="btn btn--soft btn--block"
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <>
              <Spinner />
              <span>저장 중</span>
            </>
          ) : (
            "저장하기"
          )}
        </button>
      </div>

      {photoSheetOpen && (
        <PhotoSheet
          nickname={nickname || meQuery.data?.nickname || ""}
          current={photo}
          onApply={applyPhoto}
          onClose={() => setPhotoSheetOpen(false)}
        />
      )}
    </>
  );
}

/** 사진 변경 바텀시트 — 기본 아바타 프리셋 또는 앨범 업로드 중 하나를 고른다 */
function PhotoSheet({
  nickname,
  current,
  onApply,
  onClose,
}: {
  nickname: string;
  current: string | null;
  onApply: (photo: string | null, pending: PendingPhoto | null) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(current);
  // null = 새로 고른 게 없다(저장 시 기존 사진 유지) — current 와 별개로, 사진을 아예 안 바꿨다는 뜻
  const [pendingLocal, setPendingLocal] = useState<PendingPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePreset(preset: (typeof AVATAR_PRESETS)[number]) {
    setPicked(`preset:${preset.bg}:${preset.icon}`);
    setPendingLocal({ kind: "preset", bg: preset.bg, icon: preset.icon });
  }

  function handleClear() {
    setPicked(null);
    setPendingLocal({ kind: "clear" });
  }

  function handleUploadClick() {
    const el = fileInputRef.current;
    if (!el) return;
    el.value = "";
    el.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await imageToBlob(file);
      setPicked(URL.createObjectURL(blob));
      setPendingLocal({ kind: "upload", blob, filename: file.name });
      toast.ok("사진을 불러왔어요. 확인 후 변경을 눌러주세요.");
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "TOO_LARGE"
          ? "8MB 이하 이미지만 올릴 수 있어요."
          : err instanceof Error && err.message === "IMAGE_ONLY"
            ? "이미지 파일만 선택할 수 있어요."
            : "사진을 불러오지 못했어요. 다른 파일로 시도해 주세요.";
      toast.error(msg);
    }
  }

  return (
    <Sheet
      back
      title="프로필 사진"
      sub="앨범에서 고르거나 기본 아바타를 선택하세요"
      onClose={onClose}
      foot={
        <button
          className="btn btn--block"
          type="button"
          onClick={() => onApply(picked, pendingLocal)}
        >
          이 사진으로 변경
        </button>
      }
    >
      <div className="photo__preview">
        <Avatar nickname={nickname} profileImageUrl={picked} size="xl" />
      </div>
      <button
        className="btn btn--ghost btn--block"
        type="button"
        onClick={handleUploadClick}
      >
        <Icon name="upload" size={18} />
        <span>앨범에서 사진 선택</span>
      </button>
      <p className="cond__legend" style={{ marginTop: 20 }}>
        기본 아바타
      </p>
      <div className="photogrid">
        {AVATAR_PRESETS.map((p) => {
          const url = `preset:${p.bg}:${p.icon}`;
          return (
            <button
              key={p.id}
              className="photopick"
              type="button"
              style={{ background: `#${p.bg}` }}
              aria-pressed={picked === url}
              onClick={() => handlePreset(p)}
            >
              <PersonGlyph color={`#${p.icon}`} />
            </button>
          );
        })}
      </div>
      <button
        className="btn btn--ghost btn--block btn--sm"
        type="button"
        style={{ marginTop: 18 }}
        onClick={handleClear}
      >
        기본 이미지(이니셜)로 되돌리기
      </button>
      <p className="field__help" style={{ marginTop: 12 }}>
        업로드한 사진은 정사각 256px로 줄여 저장합니다.
      </p>
      <input
        ref={fileInputRef}
        className="hidden-file"
        type="file"
        accept="image/*"
        onChange={(e) => void handleFileChange(e)}
      />
    </Sheet>
  );
}
