import {
  adminLoginAction,
  adminLogoutAction,
  createWinnerAction,
  deleteWinnerAction,
  isAdmin,
  itemStatusAction,
  updateItemAction,
  updateItemImageAction,
  updateWinnerAction,
  winnerCanSelectAction
} from "@/app/actions";
import { deliveryLabels, statusLabels } from "@/lib/labels";
import { readStore, sortItems } from "@/lib/store";
import type { ItemStatus } from "@/lib/types";

const statuses: ItemStatus[] = [
  "pending",
  "approved",
  "selected",
  "completed",
  "hidden",
  "deleted"
];

const adminErrors: Record<string, string> = {
  "image-empty": "교체할 이미지를 선택해 주세요.",
  "image-size": "이미지는 10MB 이하만 업로드할 수 있습니다.",
  "image-count": "상품 하나당 이미지는 최대 10개까지 업로드할 수 있습니다.",
  "image-type": "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
  "item-update": "상품 정보를 수정하지 못했습니다.",
  "winner-code": "이미 사용 중인 당첨자 코드입니다."
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await isAdmin();
  const { error } = await searchParams;

  if (!admin) {
    return (
      <main className="page stack">
        <section>
          <p className="eyebrow">Admin</p>
          <h1>관리자 로그인</h1>
          <p className="lead">
            기본 비밀번호는 환경 변수 ADMIN_PASSWORD로 설정합니다.
          </p>
        </section>
        {error ? <p className="notice">비밀번호가 올바르지 않습니다.</p> : null}
        <form className="form" action={adminLoginAction}>
          <div className="field">
            <label htmlFor="password">관리자 비밀번호</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="button primary" type="submit">
            로그인
          </button>
        </form>
      </main>
    );
  }

  const store = await readStore();
  const items = sortItems(store.items);

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">Admin</p>
        <h1>관리자 페이지</h1>
        <form action={adminLogoutAction}>
          <button className="button" type="submit">
            로그아웃
          </button>
        </form>
      </section>

      {error && adminErrors[error] ? (
        <p className="notice">{adminErrors[error]}</p>
      ) : null}

      <section className="section stack">
        <h2>상품 관리</h2>
        <div className="admin-list">
          {items.map((item) => (
            <article className="admin-panel" key={item.id}>
              <div className="admin-summary">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.condition}</p>
                </div>
                <div className="meta-row">
                  <span className="badge">{statusLabels[item.status]}</span>
                  <span className="badge">{deliveryLabels[item.deliveryMethod]}</span>
                </div>
                <p className="admin-contact">{item.donorContact}</p>
              </div>

              <form className="admin-edit-form" action={updateItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <label>
                  상품명
                  <input name="title" defaultValue={item.title} required />
                </label>
                <label>
                  상품 상태
                  <input name="condition" defaultValue={item.condition} required />
                </label>
                <label>
                  상품 설명
                  <textarea name="description" defaultValue={item.description} required />
                </label>
                <label>
                  전달 방식
                  <select name="deliveryMethod" defaultValue={item.deliveryMethod}>
                    <option value="shipping">배송</option>
                    <option value="direct">직거래</option>
                    <option value="negotiable">협의</option>
                  </select>
                </label>
                <label>
                  후원자 연락처
                  <input name="donorContact" defaultValue={item.donorContact} required />
                </label>
                <button className="button" type="submit">
                  상품 정보 수정
                </button>
              </form>

              <div className="admin-tools">
                <form className="admin-edit-form" action={updateItemImageAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <label>
                    이미지 교체
                    <input name="image" type="file" accept="image/*" multiple required />
                  </label>
                  <button className="button" type="submit">
                    이미지 교체
                  </button>
                </form>

                <form className="inline-form" action={itemStatusAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button className="button" type="submit">
                    상태 저장
                  </button>
                </form>

                <div className="actions">
                  {item.status === "pending" ? (
                    <form action={itemStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="button primary" type="submit">
                        승인
                      </button>
                    </form>
                  ) : null}
                  {item.status === "selected" ? (
                    <>
                      <form action={itemStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button className="button primary" type="submit">
                          전달 완료
                        </button>
                      </form>
                      <form action={itemStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button className="button" type="submit">
                          선택 취소
                        </button>
                      </form>
                    </>
                  ) : null}
                  {item.status === "approved" ? (
                    <form action={itemStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <button className="button" type="submit">
                        숨김
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section stack">
        <h2>당첨자 등록</h2>
        <form className="form" action={createWinnerAction}>
          <div className="field">
            <label htmlFor="name">당첨자명</label>
            <input id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="rank">순위</label>
            <input id="rank" name="rank" type="number" min="1" required />
          </div>
          <div className="field">
            <label htmlFor="code">코드</label>
            <input id="code" name="code" required />
          </div>
          <label className="meta-row">
            <input name="canSelect" type="checkbox" defaultChecked />
            선택 가능
          </label>
          <button className="button primary" type="submit">
            당첨자 등록
          </button>
        </form>
      </section>

      <section className="section stack">
        <h2>선택 결과</h2>
        <div className="admin-list compact">
          {store.winners.map((winner) => {
            const item = store.items.find(
              (candidate) => candidate.id === winner.selectedItemId
            );
            return (
              <article className="admin-panel winner-panel" key={winner.id}>
                <div className="admin-summary">
                  <div>
                    <h3>{winner.name}</h3>
                    <p>{winner.rank}위 · 코드 {winner.code}</p>
                  </div>
                  <div className="meta-row">
                    <span className="badge">
                      {winner.canSelect ? "선택 가능" : "선택 대기"}
                    </span>
                    <span className="badge">{item?.title ?? "선택 상품 없음"}</span>
                  </div>
                </div>

                <form className="admin-edit-form" action={updateWinnerAction}>
                  <input type="hidden" name="id" value={winner.id} />
                  <label>
                    당첨자명
                    <input name="name" defaultValue={winner.name} required />
                  </label>
                  <label>
                    순위
                    <input
                      name="rank"
                      type="number"
                      min="1"
                      defaultValue={winner.rank}
                      required
                    />
                  </label>
                  <label>
                    코드
                    <input name="code" defaultValue={winner.code} required />
                  </label>
                  <label className="meta-row">
                    <input
                      name="canSelect"
                      type="checkbox"
                      defaultChecked={winner.canSelect}
                    />
                    선택 가능
                  </label>
                  <button className="button" type="submit">
                    당첨자 수정
                  </button>
                </form>

                <div className="admin-tools">
                  <form className="inline-form" action={winnerCanSelectAction}>
                    <input type="hidden" name="id" value={winner.id} />
                    <label className="meta-row">
                      <input
                        name="canSelect"
                        type="checkbox"
                        defaultChecked={winner.canSelect}
                      />
                      선택 가능
                    </label>
                    <button className="button" type="submit">
                      선택 권한 저장
                    </button>
                  </form>
                  <form action={deleteWinnerAction}>
                    <input type="hidden" name="id" value={winner.id} />
                    <button className="button danger" type="submit">
                      당첨자 삭제
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
