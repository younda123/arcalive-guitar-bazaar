import { createItemAction } from "@/app/actions";

const errorMessages: Record<string, string> = {
  type: "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
  size: "이미지는 5MB 이하만 업로드할 수 있습니다."
};

export default async function NewItemPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">Donation</p>
        <h1>상품 등록</h1>
        <p className="lead">
          등록된 상품은 관리자 승인 전까지 공개 상품 목록에 표시되지 않습니다.
        </p>
      </section>

      {error && errorMessages[error] ? (
        <p className="notice">{errorMessages[error]}</p>
      ) : null}

      <form className="form" action={createItemAction}>
        <div className="field">
          <label htmlFor="title">상품명</label>
          <input id="title" name="title" required />
        </div>

        <div className="field">
          <label htmlFor="description">상품 설명</label>
          <textarea id="description" name="description" required />
        </div>

        <div className="field">
          <label htmlFor="condition">상품 상태</label>
          <input id="condition" name="condition" required />
        </div>

        <div className="field">
          <label htmlFor="image">상품 이미지</label>
          <input id="image" name="image" type="file" accept="image/*" />
        </div>

        <div className="field">
          <label htmlFor="deliveryMethod">전달 방식</label>
          <select id="deliveryMethod" name="deliveryMethod" defaultValue="shipping">
            <option value="shipping">배송</option>
            <option value="direct">직거래</option>
            <option value="negotiable">협의</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="donorContact">후원자 연락처</label>
          <input id="donorContact" name="donorContact" required />
        </div>

        <button className="button primary" type="submit">
          등록하기
        </button>
      </form>
    </main>
  );
}
