import { enterWinnerAction } from "@/app/actions";

export default function WinnerEntryPage() {
  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">Winner</p>
        <h1>당첨자 코드 입력</h1>
        <p className="lead">
          운영자가 발급한 코드를 입력하면 상품 선택 페이지로 이동합니다.
        </p>
      </section>

      <form className="form" action={enterWinnerAction}>
        <div className="field">
          <label htmlFor="code">당첨자 코드</label>
          <input id="code" name="code" placeholder="예: DEMO-1" required />
        </div>
        <button className="button primary" type="submit">
          확인
        </button>
      </form>
    </main>
  );
}
