"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import {
  Avatar,
  AVATAR_PRESETS,
  imageToDataUrl,
  Spinner,
} from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { describe, isApiError } from "@/lib/api/client";
import { MAX_NICKNAME, NICKNAME_DISALLOWED } from "@/lib/constants";
import { useAccounts, useMe } from "@/features/auth/session";
import { usePatchUser } from "@/features/user/queries";

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
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photoDirty, setPhotoDirty] = useState(false);
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
      const body: { nickname: string; profileImageId?: string | null } = {
        nickname,
      };
      // 명세: PATCH /user 는 profileImageUrl 이 아니라 profileImageId 를 받는다
      if (photoDirty) body.profileImageId = photoId;
      await patchUser.mutateAsync(body);
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

  function applyPhoto(nextPhoto: string | null, nextPhotoId: string | null) {
    setPhoto(nextPhoto);
    setPhotoId(nextPhotoId);
    setPhotoDirty(true);
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
            value={accountsQuery.data?.[0]?.email ?? ""}
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
  onApply: (photo: string | null, photoId: string | null) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(current);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePreset(preset: (typeof AVATAR_PRESETS)[number]) {
    setPicked(`preset:${preset.grad}:${preset.emoji}`);
    setPickedId(preset.id);
  }

  function handleClear() {
    setPicked(null);
    setPickedId(null);
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
      const url = await imageToDataUrl(file);
      setPicked(url);
      // 업로드 엔드포인트가 명세에 없어 프로토타입과 마찬가지로 dataURL 자체를 임시 id 로 쓴다
      setPickedId(`upload:${url}`);
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
          onClick={() => onApply(picked, pickedId)}
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
          const url = `preset:${p.grad}:${p.emoji}`;
          return (
            <button
              key={p.id}
              className={`photopick avatar--${p.grad}`}
              type="button"
              aria-pressed={picked === url}
              onClick={() => handlePreset(p)}
            >
              {p.emoji}
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
