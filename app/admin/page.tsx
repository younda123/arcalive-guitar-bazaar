import {
  adminLoginAction,
  adminLogoutAction,
  createWinnerAction,
  isAdmin,
  itemStatusAction,
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>상품</th>
                <th>상태</th>
                <th>전달</th>
                <th>후원자 연락처</th>
                <th>상태 변경</th>
                <th>빠른 작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <br />
                    {item.condition}
                  </td>
                  <td>{statusLabels[item.status]}</td>
                  <td>{deliveryLabels[item.deliveryMethod]}</td>
                  <td>{item.donorContact}</td>
                  <td>
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
                        저장
                      </button>
                    </form>
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>당첨자</th>
                <th>순위</th>
                <th>코드</th>
                <th>선택 가능</th>
                <th>선택 상품</th>
              </tr>
            </thead>
            <tbody>
              {store.winners.map((winner) => {
                const item = store.items.find(
                  (candidate) => candidate.id === winner.selectedItemId
                );
                return (
                  <tr key={winner.id}>
                    <td>{winner.name}</td>
                    <td>{winner.rank}</td>
                    <td>{winner.code}</td>
                    <td>
                      <form className="inline-form" action={winnerCanSelectAction}>
                        <input type="hidden" name="id" value={winner.id} />
                        <label className="meta-row">
                          <input
                            name="canSelect"
                            type="checkbox"
                            defaultChecked={winner.canSelect}
                          />
                          가능
                        </label>
                        <button className="button" type="submit">
                          저장
                        </button>
                      </form>
                    </td>
                    <td>{item?.title ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
